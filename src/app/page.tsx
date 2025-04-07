"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Clock from '@/components/Clock';
import Weather from '@/components/Weather';

export default function Home() {
  const menuItems = [
    {
      title: "BH Space",
      description: "아빠의 할일 관리",
      gradient: "from-blue-600 to-blue-400",
      path: "/dad-todo",
    },
    {
      title: "YJ Space",
      description: "엄마의 근무 일정",
      gradient: "from-purple-600 to-pink-400",
      path: "/mom-working",
    },
    {
      title: "GB Space",
      description: "규백이의 공간",
      gradient: "from-emerald-600 to-teal-400",
      path: "/gyubaeks-space",
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12">
        {/* 메인 타이틀 섹션 */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text tracking-tight">
            G.B.J
          </h1>
          
        </div>

        {/* 시계와 날씨 섹션 */}
        <div className="flex flex-col gap-4 max-w-md mx-auto mb-8">
          <div>
            <Clock />
          </div>
          <div>
            <Weather />
          </div>
        </div>

        {/* 카드 메뉴 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              href={item.path}
              className="group block"
            >
              <div className={`h-full p-5 rounded-xl bg-gradient-to-br ${item.gradient} 
                transform transition-all duration-300 
                group-hover:scale-[1.02] group-hover:shadow-lg 
                relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {item.title}
                  </h2>
                  <p className="text-zinc-100 text-sm opacity-90">
                    {item.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
