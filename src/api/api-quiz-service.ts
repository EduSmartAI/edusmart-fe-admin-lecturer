/// <reference lib="dom" />
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  ApiConfig,
  HttpClient,
  RequestParams,
  ApiResponse,
} from "EduSmart/api/api-course-service";
import { useAuthStore } from "EduSmart/stores/Auth/AuthStore";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";

export interface QuizAnswerPayload {
  answerId?: string;
  answerText?: string;
  isCorrect?: boolean;
}

export interface QuizQuestionPayload {
  questionId?: string;
  questionText?: string;
  questionType: number;
  explanation?: string;
  answers?: QuizAnswerPayload[];
}

export interface QuizPayload {
  quizId?: string;
  durationMinutes?: number;
  passingScorePercentage?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  allowRetake?: boolean;
  questions?: QuizQuestionPayload[];
}

export interface UpdateCourseQuizPayload {
  quizzes: QuizPayload[];
}

export interface UpdateCourseQuizRequest {
  courseId: string;
  updateCourseQuiz: UpdateCourseQuizPayload;
}

export type UpdateCourseQuizResponse = ApiResponse<unknown>;

const resolveQuizBaseUrl = (): string => {
  const rawQuiz = process.env.NEXT_PUBLIC_QUIZ_BASE_URL ?? "";
  const quiz = rawQuiz.replace(/\/$/, "");
  if (quiz) return quiz;

  const rawCourse = process.env.NEXT_PUBLIC_COURSE_BASE_URL ?? "";
  const course = rawCourse.replace(/\/$/, "");
  if (course) {
    // Remove trailing '/course' to reuse same origin for quiz API
    const withoutCourse = course.endsWith("/course")
      ? course.slice(0, -"/course".length)
      : course;
    if (withoutCourse) {
      return `${withoutCourse}/quiz`;
    }
  }

  const api = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (api) return `${api}/quiz`;

  if (typeof window !== "undefined") {
    try {
      const fromStorage =
        window.localStorage.getItem("NEXT_PUBLIC_QUIZ_BASE_URL") ||
        window.localStorage.getItem("NEXT_PUBLIC_COURSE_BASE_URL") ||
        window.localStorage.getItem("NEXT_PUBLIC_API_URL");
      if (fromStorage) {
        const trimmed = fromStorage.replace(/\/$/, "");
        if (trimmed.endsWith("/course")) {
          return `${trimmed.slice(0, -"/course".length)}/quiz`;
        }
        return `${trimmed}/quiz`;
      }
    } catch (error) {
      // Silent error
    }
  }

  throw new Error(
    "Missing NEXT_PUBLIC_QUIZ_BASE_URL or NEXT_PUBLIC_API_URL. Define one in .env.local"
  );
};

const getAccessToken = async (): Promise<string | null> => {
  let accessToken: string | null = null;

  if (typeof window !== "undefined") {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsedAuth = JSON.parse(authStorage);
        accessToken = parsedAuth?.state?.accessToken ?? null;
      }
    } catch (error) {
      // Silent
    }

    if (!accessToken) {
      try {
        const { getAccessTokenAction } = await import("EduSmart/app/(auth)/action");
        const result = await getAccessTokenAction();
        if (result.ok && result.accessToken) {
          accessToken = result.accessToken;
        }
      } catch (error) {
        // Silent
      }
    }
  }

  if (!accessToken) {
    const authState = useAuthStore.getState();
    if (authState.token) {
      accessToken = authState.token;
    }
  }

  if (!accessToken) {
    try {
      const { getAccessTokenAction } = await import("EduSmart/app/(auth)/action");
      const result = await getAccessTokenAction();
      if (result.ok && result.accessToken) {
        accessToken = result.accessToken;
      }
    } catch (error) {
      // Silent
    }
  }

  return accessToken;
};

export const axiosFetchQuiz = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const url = typeof input === "string" ? input : input.toString();
  const { method, headers, body, credentials } = init ?? {};

  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  const accessToken = await getAccessToken();
  if (accessToken) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const baseURL = resolveQuizBaseUrl();
  if (baseURL.includes("ngrok") || url.includes("ngrok")) {
    requestHeaders["ngrok-skip-browser-warning"] = "true";
  }

  const config: AxiosRequestConfig = {
    url,
    method: method as AxiosRequestConfig["method"],
    headers: requestHeaders,
    data: body,
    withCredentials: credentials === "include",
  };

  const axiosInstance = axios.create({
    baseURL: resolveQuizBaseUrl(),
  });

  axiosInstance.interceptors.request.use((cfg) => {
    const headersInstance = axios.AxiosHeaders.from(cfg.headers);
    const currentToken = useAuthStore.getState().token;
    const existingAuth = headersInstance.get("Authorization");

    if (!existingAuth && currentToken) {
      headersInstance.set("Authorization", `Bearer ${currentToken}`);
    }

    if (cfg.baseURL?.includes("ngrok") || cfg.url?.includes("ngrok")) {
      headersInstance.set("ngrok-skip-browser-warning", "true");
    }

    const authHeader = headersInstance.get("Authorization");

    cfg.headers = headersInstance;

    return cfg;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: any) => {
      const status = error.response?.status;
      const originalRequest = error.config;

      // Retry with refresh token on 401
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { refreshAction } = await import("EduSmart/app/(auth)/action");
          const refreshResult = await refreshAction();

          if (refreshResult.ok && refreshResult.accessToken) {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${refreshResult.accessToken}`,
            };
            return axiosInstance.request(originalRequest);
          }
        } catch (refreshError) {
          console.warn("⚠️ Access token refresh failed:", refreshError);
        }

        try {
          const authStore = useAuthStore.getState();
          if (authStore.refreshTokenValue) {
            await authStore.refreshToken();
            const refreshedToken = useAuthStore.getState().token;
            if (refreshedToken) {
              originalRequest.headers = axios.AxiosHeaders.from(originalRequest.headers);
              originalRequest.headers.set("Authorization", `Bearer ${refreshedToken}`);
              console.log("🔁 Retrying with refreshed store token");
              return axiosInstance(originalRequest);
            }
          }
        } catch (tokenError) {
          console.error("❌ Token refresh failed completely:", tokenError);
          useAuthStore.getState().logout();
          useValidateStore.getState().setInValid(true);
        }
      }

      // Final logout on persistent 403/418 after retry attempts
      if ((status === 403 || status === 418) && originalRequest._retry) {
        console.error("❌ Authorization failed after retry, logging out");
        useAuthStore.getState().logout();
        useValidateStore.getState().setInValid(true);
      }

      return Promise.reject(error);
    },
  );

  const res: AxiosResponse = await axiosInstance(config);
  const blob = new Blob([JSON.stringify(res.data)], {
    type: "application/json",
  });
  return new Response(blob, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers as HeadersInit,
  });
};

class ApiQuizModule extends HttpClient {
  constructor(config: ApiConfig) {
    super(config);
  }

  courseQuiz = {
    // Update a single quiz (matches Swagger API)
    updateSingleQuiz: (
      quiz: QuizPayload,
      params?: RequestParams,
    ) => {
      // Send quiz directly, not wrapped in courseId/updateCourseQuiz
      return this.request<UpdateCourseQuizResponse>(
        "/api/v1/CourseQuiz/UpdateQuizCourse",
        "PUT",
        quiz,
        params,
      );
    },

    // Batch update (calls API separately for each quiz)
    updateCourseQuiz: async (
      courseId: string,
      payload: UpdateCourseQuizPayload,
      params?: RequestParams,
    ) => {
      return this.request<UpdateCourseQuizResponse>(
        "/api/v1/CourseQuiz/UpdateQuizCourse",
        "PUT",
        payload,
        params,
      );
    },
  };
}

const quizService = new ApiQuizModule({
  baseUrl: resolveQuizBaseUrl(),
  customFetch: axiosFetchQuiz,
});

export const quizServiceAPI = {
  updateCourseQuiz: quizService.courseQuiz.updateCourseQuiz,
  updateSingleQuiz: quizService.courseQuiz.updateSingleQuiz,
  courseQuiz: quizService.courseQuiz,
};
