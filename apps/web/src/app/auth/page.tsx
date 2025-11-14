

import { AuthPage } from "@/app/auth/AuthPage";
import { Suspense } from "react";

export const metadata = {
  title: "Sign In | Auth",
  description: "Sign in to your account or register for a new one.",
};

export default function AuthRoute() {
  return (
    <Suspense fallback={null}>
      <AuthPage />
    </Suspense>
  );
}
