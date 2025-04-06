"use client";

import SchoolMeal from "../components/SchoolMeal";
import Link from "next/link";

export default function SchoolMealPage() {
  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-400">소현중 급식 알리미</h1>
          <Link 
            href="/gyubaeks-space"
            className="text-gray-400 hover:text-indigo-400 transition-colors"
          >
            ← 규백's Space로 돌아가기
          </Link>
        </div>

        {/* 급식 정보 컴포넌트 */}
        <SchoolMeal />
      </div>
    </main>
  );
} 