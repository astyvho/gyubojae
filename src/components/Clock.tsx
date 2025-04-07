'use client';

import { useState, useEffect } from 'react';
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (!mounted) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-zinc-400 text-lg flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            현재 시각
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-8 w-32 bg-zinc-800" />
            <Skeleton className="h-4 w-48 bg-zinc-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-zinc-400 text-lg flex items-center gap-2">
          <span className="text-2xl">⏰</span>
          현재 시각
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          <div className="text-3xl font-bold text-blue-400 tracking-wider">
            {formatTime(time)}
          </div>
          <div className="text-sm text-zinc-500">
            {formatDate(time)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 