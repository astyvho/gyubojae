"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Clock from '@/components/Clock';
import Weather from '@/components/Weather';

export default function Home() {
  const menuItems = [
    {
      title: "BH Space",
      path: "/dad-todo",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "YJ Space",
      path: "/mom-working",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "GB Space",
      path: "/gyubaeks-space",
      color: "bg-green-600 hover:bg-green-700"
    }
  ];

  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 메인 타이틀 섹션 */}
        <div className="text-center space-y-4">
          <h1 className="text-8xl font-bold text-white">G.B.J</h1>
          <p className="text-gray-400 text-lg">우리의 일상과 일정을 한 곳에서 관리하세요</p>
        </div>

        {/* 시계와 날씨를 나란히 배치 */}
        <div className="grid grid-cols-2 gap-4">
          <Clock />
          <Weather />
        </div>

        {/* 카드 메뉴 가로 일렬 배치 */}
        <div className="flex flex-row gap-4">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              href={item.path}
              className={`${item.color} flex-1 p-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105`}
            >
              <h2 className="text-2xl font-bold text-white">{item.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
