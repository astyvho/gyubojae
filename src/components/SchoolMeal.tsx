"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ko } from "date-fns/locale";

interface MealInfo {
  date: string;
  menu: string[];
}

export default function SchoolMeal() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealInfo, setMealInfo] = useState<MealInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealInfo = async () => {
      try {
        setLoading(true);
        const formattedDate = format(currentDate, "yyyyMMdd");
        const response = await fetch(
          `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=YOUR_API_KEY&Type=json&ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7530044&MLSV_YMD=${formattedDate}`
        );
        const data = await response.json();

        if (data.mealServiceDietInfo) {
          const mealData = data.mealServiceDietInfo[1].row[0];
          setMealInfo({
            date: mealData.MLSV_YMD,
            menu: mealData.DDISH_NM.split("<br/>").map((item: string) => item.trim()),
          });
        } else {
          setMealInfo(null);
        }
      } catch (error) {
        console.error("Error fetching meal info:", error);
        setMealInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMealInfo();
  }, [currentDate]);

  const handlePrevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-400">소현중 급식알리미</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevDay}
              className="text-gray-400 hover:text-purple-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-200">
              {format(currentDate, "yyyy년 MM월 dd일 (E)", { locale: ko })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              className="text-gray-400 hover:text-purple-400"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-400">급식 정보를 불러오는 중...</p>
        ) : mealInfo ? (
          <div className="space-y-2">
            {mealInfo.menu.map((item, index) => (
              <div
                key={index}
                className="p-2 bg-zinc-800 rounded-md text-gray-200"
              >
                {item}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">해당 날짜의 급식 정보가 없습니다.</p>
        )}
      </CardContent>
    </Card>
  );
} 