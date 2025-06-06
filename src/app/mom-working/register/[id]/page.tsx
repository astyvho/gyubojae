"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useParams, useRouter } from "next/navigation";

interface WorkingDay {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  user_id: string;
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState({ hour: "09", minute: "00" });
  const [endTime, setEndTime] = useState({ hour: "18", minute: "00" });
  
  // 팝업 상태 관리
  const [dateOpen, setDateOpen] = useState(false);
  const [startHourOpen, setStartHourOpen] = useState(false);
  const [startMinuteOpen, setStartMinuteOpen] = useState(false);
  const [endHourOpen, setEndHourOpen] = useState(false);
  const [endMinuteOpen, setEndMinuteOpen] = useState(false);

  // 시간과 분 옵션 생성
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, '0')
  );

  useEffect(() => {
    const fetchWorkingDay = async () => {
      try {
        const { data, error } = await supabase
          .from('working_days')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Error fetching working day:', error);
          alert('근무 기록을 불러오는 중 오류가 발생했습니다.');
          return;
        }

        if (data) {
          setDate(new Date(data.date));
          const [startHour, startMinute] = data.start_time.split(':');
          const [endHour, endMinute] = data.end_time.split(':');
          setStartTime({ hour: startHour, minute: startMinute });
          setEndTime({ hour: endHour, minute: endMinute });
        }
      } catch (error) {
        console.error('Error in fetchWorkingDay:', error);
        alert('근무 기록을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchWorkingDay();
  }, [params.id]);

  const handleSubmit = async () => {
    try {
      // 시작 시간이 종료 시간보다 늦은 경우
      const startTimeNum = parseInt(startTime.hour) * 60 + parseInt(startTime.minute);
      const endTimeNum = parseInt(endTime.hour) * 60 + parseInt(endTime.minute);
      
      if (startTimeNum >= endTimeNum) {
        alert("종료 시간은 시작 시간보다 늦어야 합니다.");
        return;
      }

      const formattedDate = format(date, "yyyy-MM-dd");
      const totalHours = (endTimeNum - startTimeNum) / 60;

      const { error } = await supabase
        .from('working_days')
        .update({
          date: formattedDate,
          start_time: `${startTime.hour}:${startTime.minute}`,
          end_time: `${endTime.hour}:${endTime.minute}`,
          total_hours: totalHours,
        })
        .eq('id', params.id);

      if (error) {
        console.error('Error updating working day:', error);
        alert('근무 기록 수정 중 오류가 발생했습니다.');
        return;
      }

      router.push('/mom-working');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert('근무 기록 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/mom-working"
            className="text-gray-400 hover:text-purple-400 transition-colors mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-purple-400">근무 정보 수정</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-purple-400">근무일 수정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 날짜 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">날짜</label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-100"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
                    {date ? format(date, "PPP", { locale: ko }) : "날짜를 선택하세요"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-700">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      if (date) {
                        setDate(date);
                        setDateOpen(false);
                      }
                    }}
                    initialFocus
                    locale={ko}
                    className="bg-zinc-800 text-gray-100"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 시작 시간 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">시작 시간</label>
              <div className="flex space-x-2">
                <Popover open={startHourOpen} onOpenChange={setStartHourOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-32 justify-start text-left font-normal bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-100"
                    >
                      <Clock className="mr-2 h-4 w-4 text-purple-400" />
                      {startTime.hour}시
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-0 bg-zinc-800 border-zinc-700">
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {hourOptions.map((hour) => (
                        <Button
                          key={hour}
                          variant="ghost"
                          className={`text-gray-100 hover:text-white hover:bg-zinc-700 ${
                            startTime.hour === hour ? 'bg-purple-600' : ''
                          }`}
                          onClick={() => {
                            setStartTime({ ...startTime, hour });
                            setStartHourOpen(false);
                          }}
                        >
                          {hour}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover open={startMinuteOpen} onOpenChange={setStartMinuteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-32 justify-start text-left font-normal bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-100"
                    >
                      <Clock className="mr-2 h-4 w-4 text-purple-400" />
                      {startTime.minute}분
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-0 bg-zinc-800 border-zinc-700">
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {minuteOptions.map((minute) => (
                        <Button
                          key={minute}
                          variant="ghost"
                          className={`text-gray-100 hover:text-white hover:bg-zinc-700 ${
                            startTime.minute === minute ? 'bg-purple-600' : ''
                          }`}
                          onClick={() => {
                            setStartTime({ ...startTime, minute });
                            setStartMinuteOpen(false);
                          }}
                        >
                          {minute}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 종료 시간 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">종료 시간</label>
              <div className="flex space-x-2">
                <Popover open={endHourOpen} onOpenChange={setEndHourOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-32 justify-start text-left font-normal bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-100"
                    >
                      <Clock className="mr-2 h-4 w-4 text-purple-400" />
                      {endTime.hour}시
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-0 bg-zinc-800 border-zinc-700">
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {hourOptions.map((hour) => (
                        <Button
                          key={hour}
                          variant="ghost"
                          className={`text-gray-100 hover:text-white hover:bg-zinc-700 ${
                            endTime.hour === hour ? 'bg-purple-600' : ''
                          }`}
                          onClick={() => {
                            setEndTime({ ...endTime, hour });
                            setEndHourOpen(false);
                          }}
                        >
                          {hour}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover open={endMinuteOpen} onOpenChange={setEndMinuteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-32 justify-start text-left font-normal bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-100"
                    >
                      <Clock className="mr-2 h-4 w-4 text-purple-400" />
                      {endTime.minute}분
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-0 bg-zinc-800 border-zinc-700">
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {minuteOptions.map((minute) => (
                        <Button
                          key={minute}
                          variant="ghost"
                          className={`text-gray-100 hover:text-white hover:bg-zinc-700 ${
                            endTime.minute === minute ? 'bg-purple-600' : ''
                          }`}
                          onClick={() => {
                            setEndTime({ ...endTime, minute });
                            setEndMinuteOpen(false);
                          }}
                        >
                          {minute}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link href="/mom-working">
                <Button 
                  variant="outline" 
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-gray-100 hover:text-white"
                >
                  취소
                </Button>
              </Link>
              <Button 
                onClick={handleSubmit} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                수정
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 