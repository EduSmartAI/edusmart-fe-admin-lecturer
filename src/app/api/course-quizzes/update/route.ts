import { NextRequest, NextResponse } from 'next/server';
import { quizServiceAPI, type QuizPayload, type UpdateCourseQuizPayload } from 'EduSmart/api/api-quiz-service';

type AuthHeader = Record<string, string> & { Authorization: string };

type AuthHeaderSource = 'idToken' | 'accessToken' | 'none';

interface AuthResolutionResult {
  headers?: AuthHeader;
  source: AuthHeaderSource;
  reason?: string;
}

async function resolveQuizAuthHeader(): Promise<AuthResolutionResult> {
  try {
    const { getAccessTokenAction } = await import('EduSmart/app/(auth)/action');

    // Just use access token - quiz service should accept it
    const accessTokenResult = await getAccessTokenAction();
    if (accessTokenResult.ok && accessTokenResult.accessToken) {
      return {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessTokenResult.accessToken}`,
        },
        source: 'accessToken',
      };
    }

    return {
      source: 'none',
      reason: 'No access token found in cookies/session',
    };
  } catch (error) {
    console.warn('⚠️ Unable to resolve quiz auth header:', error);
    return {
      source: 'none',
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const dynamic = 'force-dynamic';

type UpdateCourseQuizRequestBody =
  | {
      courseId?: string;
      payload?: UpdateCourseQuizPayload;
      quizzes?: undefined;
    };

export async function POST(request: NextRequest) {
  try {
    const { courseId, payload, quizzes } = (await request.json()) as UpdateCourseQuizRequestBody;

    const quizList: QuizPayload[] = Array.isArray(quizzes)
      ? quizzes
      : Array.isArray(payload?.quizzes)
        ? payload!.quizzes
        : [];

    if (!courseId || quizList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing courseId or quizzes for quiz update request.',
        },
        { status: 400 },
      );
    }

    const auth = await resolveQuizAuthHeader();

    const response = await quizServiceAPI.updateCourseQuiz(
      courseId,
      { quizzes: quizList },
      auth.headers ? { headers: auth.headers } : undefined,
    );

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          message: response.message || 'Quiz update failed',
          response,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred while updating course quizzes.';

    return NextResponse.json(
      {
        success: false,
        message,
        errorDetails: error && typeof error === 'object' && 'response' in error 
          ? {
              status: (error as { response?: { status?: number; data?: unknown } }).response?.status,
              data: (error as { response?: { status?: number; data?: unknown } }).response?.data,
            }
          : undefined,
      },
      { status: 500 },
    );
  }
}
