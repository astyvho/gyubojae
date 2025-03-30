"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ClipboardList, Wallet, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import { supabase, TuitionFee } from "@/lib/supabase";

interface DashboardStats {
  unpaidFees: number;
  workingDays: number;
  todoCount: number;
}

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

export default function MomWorkingPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    unpaidFees: 0,
    workingDays: 0,
    todoCount: 0,
  });
  const [tuitionFees, setTuitionFees] = useState<TuitionFee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workingDays, setWorkingDays] = useState<Date[]>([
    new Date(2024, 2, 1),
    new Date(2024, 2, 4),
    new Date(2024, 2, 5),
    new Date(2024, 2, 6),
    new Date(2024, 2, 7),
    new Date(2024, 2, 8),
  ]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([
    { id: 1, title: "학원비 납부하기", completed: false },
    { id: 2, title: "일정 확인하기", completed: true },
    { id: 3, title: "보고서 작성하기", completed: false },
  ]);

  useEffect(() => {
    fetchTuitionFees();
  }, []);

  const fetchTuitionFees = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching tuition fees...'); // 디버깅용 로그

      const { data, error } = await supabase
        .from('tuition_fees')
        .select(`
          *,
          tuition_payments (
            id,
            year,
            month,
            paid_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Fetched data:', data); // 디버깅용 로그
      setTuitionFees(data || []);
    } catch (error) {
      console.error('Error fetching tuition fees:', error);
      setTuitionFees([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 달력 관련 함수들
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 달력 시작일을 일요일로 맞추기 위해 이전 달의 날짜들을 추가
  const firstDayOfMonth = getDay(monthStart);
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfMonth - i));
    return date;
  });

  const allDays = [...prevMonthDays, ...daysInMonth];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTuitionFeesForDate = (date: Date) => {
    return tuitionFees.filter((fee) => {
      const isDueDate = fee.due_date === date.getDate();
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isCurrentYear = date.getFullYear() === currentDate.getFullYear();
      return isDueDate && isCurrentMonth && isCurrentYear;
    });
  };

  // 달력의 날짜별 납부 상태 확인
  const getPaymentStatusForDate = (date: Date, fee: TuitionFee) => {
    if (!fee.is_monthly || !fee.tuition_payments) return false;
    return fee.tuition_payments.some(
      payment => 
        payment.year === date.getFullYear() && 
        payment.month === (date.getMonth() + 1) // 1부터 시작하는 월로 변경
    );
  };

  const handleTodoToggle = (id: number) => {
    setTodoItems(todoItems.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 통계 업데이트
  useEffect(() => {
    if (isLoading) return;

    const calculateStats = () => {
      const unpaidTuition = tuitionFees.reduce((sum, fee) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1부터 시작하는 월로 변경
        const isDueDate = fee.due_date <= now.getDate();
        
        // 현재 달의 납부일이 지났고, 이번 달에 납부하지 않은 경우
        if (isDueDate && fee.is_monthly) {
          const hasPayment = fee.tuition_payments?.some(
            payment => 
              payment.year === currentYear && 
              payment.month === currentMonth
          ) ?? false;
          if (!hasPayment) {
            return sum + fee.amount;
          }
        }
        return sum;
      }, 0);

      return {
        unpaidFees: unpaidTuition,
        workingDays: workingDays.length,
        todoCount: todoItems.filter((todo) => !todo.completed).length,
      };
    };

    const newStats = calculateStats();
    setStats(newStats);
  }, [tuitionFees, workingDays, todoItems, currentDate, isLoading]);

  // 납입 완료 처리 함수
  const handlePayment = async (feeId: string) => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1부터 시작하는 월로 변경
      
      console.log('Recording payment:', { feeId, currentYear, currentMonth }); // 디버깅용 로그

      const { data: existingPayment } = await supabase
        .from('tuition_payments')
        .select('*')
        .eq('tuition_fee_id', feeId)
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .single();

      if (existingPayment) {
        console.log('Payment already exists for this month');
        return;
      }

      const { data, error } = await supabase
        .from('tuition_payments')
        .insert([
          {
            tuition_fee_id: feeId,
            year: currentYear,
            month: currentMonth,
            paid_at: now.toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Payment error details:', error);
        throw error;
      }

      console.log('Payment recorded:', data); // 디버깅용 로그

      // 학원비 목록 새로고침
      await fetchTuitionFees();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  // 학원비 삭제 함수
  const handleDeleteTuition = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tuition_fees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 학원비 목록 새로고침
      await fetchTuitionFees();
    } catch (error) {
      console.error('Error deleting tuition fee:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      {/* 상단 헤더 */}
      <div className="bg-zinc-900/50 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              영재's space
            </h1>
            <Link 
              href="/"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              ← 메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 등록 버튼 카드 섹션 */}
            <Link href="/mom-working/tuition">
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur border-purple-700/50 shadow-xl hover:from-purple-900/70 hover:to-purple-800/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-purple-300 flex items-center group-hover:text-purple-200 transition-colors">
                    <Wallet className="w-5 h-5 mr-2" />
                    학원비 등록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/70 group-hover:text-purple-200 transition-colors">학원비 정보를 등록하고 관리하세요</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mom-working/working-days">
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur border-purple-700/50 shadow-xl hover:from-purple-900/70 hover:to-purple-800/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-purple-300 flex items-center group-hover:text-purple-200 transition-colors">
                    <Calendar className="w-5 h-5 mr-2" />
                    근무일 등록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/70 group-hover:text-purple-200 transition-colors">근무일을 등록하고 관리하세요</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mom-working/todo">
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur border-purple-700/50 shadow-xl hover:from-purple-900/70 hover:to-purple-800/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-purple-300 flex items-center group-hover:text-purple-200 transition-colors">
                    <ClipboardList className="w-5 h-5 mr-2" />
                    할일 등록
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-200/70 group-hover:text-purple-200 transition-colors">할일을 등록하고 관리하세요</p>
                </CardContent>
              </Card>
            </Link>

            {/* 1. 통계 카드 섹션 */}
            <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-purple-400 flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  미납 학원비
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ₩{stats.unpaidFees.toLocaleString()}
                </div>
                <p className="text-gray-400 text-sm mt-1">이번 달 미납 금액</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-purple-400 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  근무일
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.workingDays}일</div>
                <p className="text-gray-400 text-sm mt-1">이번 달 근무일</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-purple-400 flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2" />
                  할 일
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.todoCount}개</div>
                <p className="text-gray-400 text-sm mt-1">남은 할 일</p>
              </CardContent>
            </Card>

            {/* 2. 달력 섹션 */}
            <div className="col-span-full">
              <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium text-purple-400">
                    {format(currentDate, "yyyy년 MM월")}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevMonth}
                      className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextMonth}
                      className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-200 py-3 border-b border-zinc-800"
                      >
                        {day}
                      </div>
                    ))}
                    {allDays.map((date, index) => {
                      const isCurrentMonth = isSameMonth(date, currentDate);
                      const isTodayDate = isToday(date);
                      const isWorkingDay = workingDays.includes(date.getDate());
                      const dayFees = getTuitionFeesForDate(date);

                      return (
                        <div
                          key={index}
                          className={`min-h-[80px] p-3 border border-zinc-800 rounded-lg relative ${
                            isCurrentMonth
                              ? isWorkingDay 
                                ? "bg-purple-900/30 backdrop-blur"
                                : "bg-zinc-800/70 backdrop-blur"
                              : "bg-zinc-900/30 backdrop-blur text-gray-500"
                          } ${isTodayDate ? "ring-2 ring-purple-500" : ""} 
                          hover:bg-purple-900/40 transition-colors group`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-base font-medium ${
                              isWorkingDay ? "text-purple-300" : 
                              isCurrentMonth ? "text-gray-100" : "text-gray-500"
                            } group-hover:text-purple-200 transition-colors`}>
                              {format(date, "d")}
                            </span>
                            {isWorkingDay && (
                              <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:bg-purple-300 transition-colors" />
                            )}
                          </div>
                          {dayFees.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {dayFees.map((fee, i) => (
                                <div
                                  key={i}
                                  className="text-xs px-1.5 py-1 rounded bg-purple-500/30 text-purple-200 font-medium backdrop-blur-sm
                                  group-hover:bg-purple-500/40 group-hover:text-purple-100 transition-colors"
                                >
                                  {fee.academy_name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3. 등록된 학원비 섹션 */}
            <div className="col-span-full">
              <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-lg font-medium text-purple-400">등록된 학원비</CardTitle>
                  <Link href="/mom-working/tuition">
                    <Button variant="outline" className="bg-purple-600 hover:bg-purple-700 border-0">
                      학원비 등록
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tuitionFees.map((fee) => {
                      const currentPayment = fee.tuition_payments?.find(
                        payment =>
                          payment.year === currentDate.getFullYear() &&
                          payment.month === (currentDate.getMonth() + 1) // 1부터 시작하는 월로 변경
                      );

                      return (
                        <div
                          key={fee.id}
                          className="flex items-center justify-between p-4 bg-zinc-800/50 backdrop-blur rounded-lg border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                        >
                          <div>
                            <h3 className="text-white font-medium">{fee.academy_name}</h3>
                            <p className="text-gray-400 text-sm">
                              매월 {fee.due_date}일 | ₩{fee.amount.toLocaleString()}
                            </p>
                            {currentPayment && (
                              <p className="text-green-400 text-sm mt-1">
                                납입완료 ({new Date(currentPayment.paid_at).toLocaleDateString()})
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!currentPayment && fee.is_monthly && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePayment(fee.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                납입
                              </Button>
                            )}
                            <Link href={`/mom-working/tuition/edit/${fee.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-purple-400"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTuition(fee.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {tuitionFees.length === 0 && (
                      <p className="text-gray-400 text-center py-8">등록된 학원비가 없습니다.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 4. 할일 목록 섹션 */}
            <div className="col-span-full">
              <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-purple-400">할 일 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {todoItems.map((todo, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-zinc-800/50 backdrop-blur rounded-lg border border-zinc-700/50 hover:bg-zinc-800 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleTodoToggle(index)}
                          className="rounded border-zinc-600 text-purple-600 focus:ring-purple-600"
                        />
                        <span className={todo.completed ? "text-gray-500 line-through" : "text-white"}>
                          {todo.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 