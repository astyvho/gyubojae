'use client';

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Clock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${time.getFullYear()}년 ${time.getMonth() + 1}월 ${time.getDate()}일 (${weekDays[time.getDay()]})`;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-lg text-zinc-400">
          <span>⏰</span>
          <span>현재 시각</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0 space-y-0">
        {!mounted ? (
          <>
            <Skeleton className="h-8 w-32 bg-zinc-800" />
            <Skeleton className="h-4 w-48 bg-zinc-800" />
          </>
        ) : (
          <>
            <p className="text-3xl font-bold tracking-wider text-blue-400">
              {time.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </p>
            <p className="text-sm text-zinc-500">{formattedDate}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
} 