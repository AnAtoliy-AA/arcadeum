import { Suspense } from "react";
import { ChatPage } from "./ChatPage";

export default function ChatRoute() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}

