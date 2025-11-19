
"use client";

import { Suspense } from "react";
import WeeklySchedule from "./WeeklySchedule";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WeeklySchedule />
    </Suspense>
  );
}
