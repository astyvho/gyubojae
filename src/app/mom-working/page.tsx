"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ClipboardList, Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, getDate, getMonth, getYear, subDays, addDays, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import { supabase } from "@/lib/supabase";

interface WorkingDay {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  user_id: string;
}

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
}

export default function MomWorkingPage() {
  const [activeTab, setActiveTab] = useState<'work' | 'todo'>('work');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [newTodo, setNewTodo] = useState("");
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [todoFilter, setTodoFilter] = useState<'all' | 'active' | 'completed'>('all');

  // 근무일 데이터 가져오기
  const fetchWorkingDays = async () => {
    try {
      const { data, error } = await supabase
        .from('working_days')
        .select('*')
        .eq('user_id', '1')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching working days:', error);
        return;
      }

      if (data) {
        console.log('Fetched working days:', data); // 디버깅용 로그
        setWorkingDays(data);
        const hours = data.reduce((sum: number, day: WorkingDay) => sum + day.total_hours, 0);
        setTotalHours(hours);
      }
    } catch (error) {
      console.error('Error in fetchWorkingDays:', error);
    }
  };

  // 할일 목록 가져오기
  const fetchTodoItems = async () => {
    try {
      const { data, error } = await supabase
        .from('moms_todos')
        .select('*')
        .eq('user_id', '1')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todo items:', error);
        return;
      }

      if (data) {
        console.log('Fetched todo items:', data); // 디버깅용 로그
        setTodoItems(data);
      }
    } catch (error) {
      console.error('Error in fetchTodoItems:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchWorkingDays();
    fetchTodoItems();
  }, []);

  // 달력 날짜 계산
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 달력 시작일을 일요일로 맞추기 위해 이전 달의 날짜들을 추가
  const startDay = getDay(monthStart);
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
    return subDays(monthStart, startDay - i);
  }).reverse();

  // 달력 마지막일을 토요일로 맞추기 위해 다음 달의 날짜들을 추가
  const endDay = getDay(monthEnd);
  const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
    return addDays(monthEnd, i + 1);
  });

  // 모든 날짜를 합쳐서 달력 데이터 생성
  const calendarDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  // 근무일 삭제
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('working_days')
        .delete()
        .eq('id', id)
        .eq('user_id', '1');

      if (error) {
        console.error('Error deleting working day:', error);
        return;
      }

      // 삭제 후 데이터 다시 불러오기
      fetchWorkingDays();
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };

  // 할일 추가
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const { data, error } = await supabase
        .from('moms_todos')
        .insert([
          {
            title: newTodo.trim(),
            completed: false,
            user_id: '1'
          }
        ])
        .select();

      if (error) {
        console.error('Error adding todo:', error);
        alert('할일 추가 중 오류가 발생했습니다.');
        return;
      }

      if (data) {
        console.log('Added new todo:', data); // 디버깅용 로그
        await fetchTodoItems(); // 전체 목록 다시 불러오기
        setNewTodo("");
      }
    } catch (error) {
      console.error('Error in handleAddTodo:', error);
      alert('할일 추가 중 오류가 발생했습니다.');
    }
  };

  // 할일 토글
  const handleTodoToggle = async (id: string) => {
    try {
      const todo = todoItems.find(t => t.id === id);
      if (!todo) return;

      const { error } = await supabase
        .from('moms_todos')
        .update({ completed: !todo.completed })
        .eq('id', id)
        .eq('user_id', '1');

      if (error) {
        console.error('Error toggling todo:', error);
        alert('할일 상태 변경 중 오류가 발생했습니다.');
        return;
      }

      await fetchTodoItems(); // 전체 목록 다시 불러오기
    } catch (error) {
      console.error('Error in handleTodoToggle:', error);
      alert('할일 상태 변경 중 오류가 발생했습니다.');
    }
  };

  // 할일 삭제
  const handleDeleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('moms_todos')
        .delete()
        .eq('id', id)
        .eq('user_id', '1');

      if (error) {
        console.error('Error deleting todo:', error);
        alert('할일 삭제 중 오류가 발생했습니다.');
        return;
      }

      await fetchTodoItems(); // 전체 목록 다시 불러오기
    } catch (error) {
      console.error('Error in handleDeleteTodo:', error);
      alert('할일 삭제 중 오류가 발생했습니다.');
    }
  };

  // 할일 수정
  const handleEditTodo = (id: string) => {
    const todo = todoItems.find(t => t.id === id);
    if (todo) {
      setEditingTodo(id);
      setEditText(todo.title);
    }
  };

  // 할일 수정 저장
  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('moms_todos')
        .update({ title: editText.trim() })
        .eq('id', id)
        .eq('user_id', '1');

      if (error) {
        console.error('Error updating todo:', error);
        alert('할일 수정 중 오류가 발생했습니다.');
        return;
      }

      await fetchTodoItems(); // 전체 목록 다시 불러오기
      setEditingTodo(null);
      setEditText("");
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      alert('할일 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditText("");
  };

  // 달력 이동 함수
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/"
            className="text-gray-400 hover:text-purple-400 transition-colors mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-purple-400">영재's space</h1>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-4 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('work')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'work'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-purple-400'
            }`}
          >
            근무확인
          </button>
          <button
            onClick={() => setActiveTab('todo')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'todo'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-purple-400'
            }`}
          >
            할일 목록
          </button>
        </div>

        {activeTab === 'work' ? (
          <div className="space-y-6">
            {/* 근무 기록 카드 */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-purple-400">근무 기록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-gray-200">
                    <p>총 근무 시간: {totalHours.toFixed(1)}시간</p>
                    <p>근무일: {workingDays.length}일</p>
                  </div>
                  <Link href="/mom-working/register">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
                      근무 등록
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* 달력 카드 */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-purple-400">
                  {format(currentDate, "yyyy년 MM월", { locale: ko })}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevMonth}
                    className="text-gray-400 hover:text-purple-400 hover:bg-purple-900/20"
                  >
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    className="text-gray-400 hover:text-purple-400 hover:bg-purple-900/20"
                  >
                    다음
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-400 py-3"
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((date, index) => {
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isTodayDate = isToday(date);
                    const isWorkingDay = workingDays.some(day => 
                      new Date(day.date).toDateString() === date.toDateString()
                    );

                    return (
                      <div
                        key={index}
                        className={`p-2 text-center rounded-lg transition-all duration-200 ${
                          isCurrentMonth
                            ? isWorkingDay
                              ? "bg-purple-900/30 hover:bg-purple-900/50"
                              : "bg-zinc-800/50 hover:bg-zinc-800/70"
                            : "bg-zinc-900/30 text-gray-500"
                        } ${isTodayDate ? "ring-2 ring-purple-500 bg-purple-900/50" : ""}`}
                      >
                        <div className={`text-sm font-medium ${
                          isCurrentMonth
                            ? isWorkingDay
                              ? "text-purple-300"
                              : "text-white"
                            : "text-gray-500"
                        }`}>
                          {format(date, "d")}
                        </div>
                        {isWorkingDay && (
                          <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto mt-1 shadow-[0_0_8px_rgba(192,132,252,0.5)]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 근무 기록 리스트 */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-purple-400">근무 기록 리스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-purple-400">근무 기록</h2>
                  <div className="space-y-2">
                    {workingDays.map((day) => (
                      <div
                        key={day.id}
                        className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="text-gray-100">{format(new Date(day.date), "PPP", { locale: ko })}</p>
                          <p className="text-sm text-gray-400">
                            {day.start_time} ~ {day.end_time} ({Math.floor(day.total_hours)}시간 {Math.round((day.total_hours % 1) * 60)}분)
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/mom-working/register/${day.id}`}>
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
                            className="text-gray-400 hover:text-red-400"
                            onClick={() => handleDelete(day.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-purple-400">할일 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    placeholder="할일을 입력하세요"
                    className="flex-1 bg-zinc-800 border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button onClick={handleAddTodo} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex space-x-2 pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTodoFilter('all')}
                    className={`${
                      todoFilter === 'all'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/20'
                    }`}
                  >
                    전체
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTodoFilter('active')}
                    className={`${
                      todoFilter === 'active'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/20'
                    }`}
                  >
                    미완료
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTodoFilter('completed')}
                    className={`${
                      todoFilter === 'completed'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/20'
                    }`}
                  >
                    완료
                  </Button>
                </div>

                <div className="space-y-2">
                  {todoItems
                    .filter(todo => {
                      if (todoFilter === 'active') return !todo.completed;
                      if (todoFilter === 'completed') return todo.completed;
                      return true;
                    })
                    .map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                      >
                        {editingTodo === todo.id ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 bg-zinc-700 border-zinc-600 rounded-md px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-400 hover:text-green-500"
                              onClick={() => handleSaveEdit(todo.id)}
                            >
                              저장
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-gray-500"
                              onClick={handleCancelEdit}
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3 flex-1">
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleTodoToggle(todo.id)}
                                className="rounded border-zinc-600 text-purple-600 focus:ring-purple-600"
                              />
                              <span className={todo.completed ? "text-gray-500 line-through" : "text-white"}>
                                {todo.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-purple-400 hover:text-purple-500"
                                onClick={() => handleEditTodo(todo.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-500"
                                onClick={() => handleDeleteTodo(todo.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
} 