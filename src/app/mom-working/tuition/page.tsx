"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wallet, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase, TuitionFee } from "@/lib/supabase";

interface FormData {
  academyName: string;
  amount: string;
  dueDate: Date;
}

export default function TuitionRegistrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    academyName: "",
    amount: "",
    dueDate: new Date(),
  });
  const [tuitionFees, setTuitionFees] = useState<TuitionFee[]>([]);

  useEffect(() => {
    fetchTuitionFees();
  }, []);

  const fetchTuitionFees = async () => {
    try {
      const { data, error } = await supabase
        .from('tuition_fees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTuitionFees(data || []);
    } catch (error) {
      console.error('Error fetching tuition fees:', error);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, amount: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleConfirmedSubmit = async () => {
    try {
      // 데이터 유효성 검사
      if (!formData.academyName || !formData.amount || !formData.dueDate) {
        throw new Error('모든 필드를 입력해주세요.');
      }

      const tuitionData = {
        academy_name: formData.academyName,
        amount: parseInt(formData.amount),
        due_date: formData.dueDate.getDate(),
        is_monthly: true,
        user_id: 'default'
      };

      console.log('Inserting data:', tuitionData); // 디버깅용 로그

      const { data, error } = await supabase
        .from('tuition_fees')
        .insert([tuitionData])
        .select();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`학원비 등록 중 오류가 발생했습니다: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('데이터가 성공적으로 등록되지 않았습니다.');
      }

      // 성공적으로 등록된 후 폼 초기화
      setFormData({
        academyName: "",
        amount: "",
        dueDate: new Date(),
      });

      // 학원비 목록 새로고침
      fetchTuitionFees();
    } catch (error) {
      console.error('Error registering tuition fee:', error);
      // 여기에 사용자에게 오류 메시지를 보여주는 로직을 추가할 수 있습니다
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tuition_fees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 삭제 후 목록 새로고침
      fetchTuitionFees();
    } catch (error) {
      console.error('Error deleting tuition fee:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Link 
            href="/mom-working"
            className="text-gray-400 hover:text-purple-400 transition-colors mr-4 flex items-center group"
          >
            <ArrowLeft className="h-5 w-5 mr-1 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            <span>돌아가기</span>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            학원비 등록
          </h1>
        </div>

        <Card className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-purple-400">학원비 정보 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="academyName" className="text-gray-200">학원 이름</Label>
                <Input
                  id="academyName"
                  value={formData.academyName}
                  onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
                  className="bg-zinc-800/50 backdrop-blur border-zinc-700 h-12 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-200">월 학원비</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200">₩</span>
                  <Input
                    id="amount"
                    type="text"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className="bg-zinc-800/50 backdrop-blur border-zinc-700 h-12 pl-8 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-gray-200">납부일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 bg-zinc-800/50 backdrop-blur border-zinc-700 text-left font-normal text-white justify-start hover:bg-zinc-700/50 hover:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : <span>날짜 선택</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({ ...formData, dueDate: date });
                          // 달력 닫기
                          const popoverTrigger = document.querySelector('[data-state="open"]');
                          if (popoverTrigger) {
                            (popoverTrigger as HTMLButtonElement).click();
                          }
                        }
                      }}
                      className="bg-transparent"
                      classNames={{
                        months: "text-white",
                        head_cell: "text-gray-200",
                        cell: "text-sm p-0",
                        day: "h-9 w-9 font-normal aria-selected:bg-purple-600 hover:bg-zinc-800/50 focus:bg-purple-500 transition-colors text-gray-100",
                        day_today: "bg-zinc-800/50 text-white font-semibold",
                        day_selected: "bg-purple-600 text-white hover:bg-purple-700",
                        nav_button: "text-gray-200 hover:bg-zinc-800/50 transition-colors",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        caption: "flex justify-center pt-1 relative items-center text-white font-medium",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="p-4 bg-zinc-800/50 backdrop-blur rounded-lg border border-zinc-700/50">
                <p className="text-sm text-gray-200">
                  * 학원비는 선택한 날짜 기준으로 1년 동안 매달 자동으로 등록됩니다.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                  >
                    등록하기
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-zinc-900/95 backdrop-blur border-zinc-700 shadow-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-white">
                      학원비 등록 확인
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-200">
                      다음 정보로 학원비를 등록하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-3 mt-2">
                    <div className="bg-zinc-800/50 backdrop-blur p-4 rounded-lg space-y-2 border border-zinc-700/50">
                      <div className="flex justify-between">
                        <span className="text-gray-400">학원</span>
                        <span className="text-white font-medium">{formData.academyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">금액</span>
                        <span className="text-white font-medium">₩{formData.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">납부일</span>
                        <span className="text-white font-medium">매월 {formData.dueDate.getDate()}일</span>
                      </div>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-zinc-800/50 text-white hover:bg-zinc-700/50 border-zinc-700 transition-colors">
                      취소
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirmedSubmit}
                      className="bg-purple-600 text-white hover:bg-purple-700 border-0 transition-colors"
                    >
                      등록
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </form>
          </CardContent>
        </Card>

        {/* 등록된 학원비 목록 */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">등록된 학원비</h2>
          <div className="space-y-4">
            {tuitionFees.map((fee) => (
              <Card key={fee.id} className="bg-zinc-900/50 backdrop-blur border-zinc-800 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="text-white font-medium">{fee.academy_name}</h3>
                        <p className="text-gray-400 text-sm">
                          매월 {fee.due_date}일 / ₩{fee.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => handleDelete(fee.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tuitionFees.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                등록된 학원비가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 