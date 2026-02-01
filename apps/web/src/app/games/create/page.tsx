import { Suspense } from "react";
import { CreateGameRoomPage } from "./CreateGameRoomPage";

export default function CreateGameRoomRoute() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
      <CreateGameRoomPage />
    </Suspense>
  );
}

