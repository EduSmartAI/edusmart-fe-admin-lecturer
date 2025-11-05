"use client";

import { useEffect } from "react";
import { setupAxiosInterceptors } from "EduSmart/hooks/apiErrorInterceptor";

export function APIInterceptorInitializer() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return null;
}
