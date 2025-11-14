import { HomePage } from "@/app/home/HomePage";
import { Suspense } from "react";

export const metadata = {
  title: "Home | Welcome",
  description: "Welcome to the home page of the app.",
};

export default function HomeRoute() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
