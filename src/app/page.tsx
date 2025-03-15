"use client";

import Clock from "./components/Clock";
import Weather from "./components/Weather";
import Todo from "./components/Todo";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-indigo-400 mb-6">Bravo의 Todo List</h1>
        
        {/* 시계와 날씨를 나란히 배치 */}
        <div className="grid grid-cols-2 gap-4">
          <Clock />
          <Weather />
        </div>

        {/* Todo 리스트 */}
        <Todo />
      </div>
    </main>
  );
}
