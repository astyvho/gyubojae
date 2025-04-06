"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  const menuItems = [
    {
      title: "보현's Space",
      description: "보현의 공간입니다.",
      path: "/dad-todo",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "영재's Space",
      description: "영재의 공간입니다.",
      path: "/mom-working",
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "규백's Space",
      description: "규백이의 공간입니다.",
      path: "/gyubaeks-space",
      color: "bg-green-600 hover:bg-green-700"
    }
  ];

  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* 메인 타이틀 섹션 */}
        <div className="text-center space-y-4">
          <h1 className="text-8xl font-bold text-white">G.B.J</h1>
          <p className="text-gray-400 text-lg">우리의 일상과 일정을 한 곳에서 관리하세요</p>
        </div>

        {/* 카드 메뉴 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              href={item.path}
              className={`${item.color} p-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105`}
            >
              <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
              <p className="text-gray-200">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
