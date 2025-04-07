'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GyubaekSpacePage() {
  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-400">규백's Space</h1>
          <Link 
            href="/"
            className="text-gray-400 hover:text-indigo-400 transition-colors"
          >
            ← 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/school-meal">
            <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  소현중 급식알리미
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-4">소현중학교의 급식 정보를 확인하세요</p>
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm">
                    실시간 급식 정보
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/gyubaeks-space/todo">
            <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  규백 할일목록
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-4">할일을 관리하고 체크하세요</p>
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm">
                    할일 관리
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/gyubaeks-space/study">
            <Card className="h-full bg-zinc-900 border-zinc-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  규백 공부놀이터
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-4">즐겁게 공부하는 공간</p>
                <div className="flex justify-center">
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm">
                    학습 공간
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
} 