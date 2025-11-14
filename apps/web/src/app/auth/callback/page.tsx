"use client";

import { AuthPage } from "@/app/auth/AuthPage";

import { Suspense } from "react";

export default function AuthCallbackRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPage />
    </Suspense>
  );
}
