"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // 초기 시간 설정
    setTime(new Date());

    // 1초마다 시간 업데이트
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // 시간이 설정되기 전에는 로딩 상태 표시
  if (!time) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-400">현재 시각</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="h-10 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedTime = format(time, "HH:mm:ss", { locale: ko });
  const formattedDate = format(time, "M월 d일 (E)", { locale: ko });

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-400">현재 시각</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-4xl font-bold text-blue-400">{formattedTime}</p>
          <p className="text-sm text-zinc-500">{formattedDate}</p>
        </div>
      </CardContent>
    </Card>
  );
} 