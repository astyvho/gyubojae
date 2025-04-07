"use client";

import Clock from "../components/Clock";
import Weather from "../components/Weather";
import Todo from "../components/Todo";
import Link from "next/link";

export default function DadTodoPage() {
  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-indigo-400">보현's Space</h1>
          <Link 
            href="/"
            className="text-gray-400 hover:text-indigo-400 transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>
        
       

        {/* Todo 리스트 */}
        <Todo />
      </div>
    </main>
  );
} 