"use client";

import { useState, useEffect } from "react";

interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitaminA: number;
  thiamine: number;  // 티아민
  riboflavin: number;  // 리보플라빈
  vitaminC: number;
  calcium: number;
  iron: number;
}

interface MealInfo {
  date: string;
  lunch: string[];
  nutrition: Nutrition;
}

interface NeisApiResponse {
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
  mealServiceDietInfo?: Array<{
    row?: Array<{
      MLSV_YMD: string;
      DDISH_NM: string;
      NTR_INFO: string;
      CAL_INFO: string;
    }>;
  }>;
}

export default function SchoolMeal() {
  const [weekData, setWeekData] = useState<MealInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 영양 정보 파싱 함수
  const parseNutrition = (nutritionStr: string): Nutrition => {
    const nutrition: Nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      vitaminA: 0,
      thiamine: 0,
      riboflavin: 0,
      vitaminC: 0,
      calcium: 0,
      iron: 0
    };

    try {
      if (!nutritionStr) return nutrition;

      // 영양 정보 문자열을 배열로 분리
      const lines = nutritionStr.split('<br/>');
      
      // 각 라인 파싱
      lines.forEach(line => {
        // 콜론으로 키와 값 분리
        const parts = line.split(':');
        if (parts.length < 2) return;
        
        const key = parts[0].trim();
        const valueStr = parts[1].trim();
        const value = parseFloat(valueStr);
        
        // 유효한 숫자인 경우만 처리
        if (!isNaN(value)) {
          // 항목별 매칭
          if (key.includes('탄수화물')) {
            nutrition.carbs = value;
          } else if (key.includes('단백질')) {
            nutrition.protein = value;
          } else if (key.includes('지방')) {
            nutrition.fat = value;
          } else if (key.includes('비타민A')) {
            nutrition.vitaminA = value;
          } else if (key.includes('티아민')) {
            nutrition.thiamine = value;
          } else if (key.includes('리보플라빈')) {
            nutrition.riboflavin = value;
          } else if (key.includes('비타민C')) {
            nutrition.vitaminC = value;
          } else if (key.includes('칼슘')) {
            nutrition.calcium = value;
          } else if (key.includes('철분')) {
            nutrition.iron = value;
          }
        }
      });

      console.log('영양 정보 파싱 결과:', {
        원본: nutritionStr,
        파싱결과: nutrition,
        비타민A_원본: lines.find(line => line.includes('비타민A'))
      });
    } catch (e) {
      console.error('영양 정보 파싱 오류:', e);
    }

    return nutrition;
  };

  // 급식 메뉴 파싱 함수
  const parseMealMenu = (menuStr: string): string[] => {
    return menuStr.split('<br/>').map(item => item.trim());
  };

  // 이번 주의 월요일 날짜 구하기
  const getMonday = (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // 일요일이면 이전 주 월요일
    result.setDate(diff);
    return result;
  };

  // 주간 날짜 배열 생성 (월~금)
  const getWeekDays = (monday: Date): Date[] => {
    const weekDays: Date[] = [];
    for (let i = 0; i < 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  // 날짜를 YYYYMMDD 형식의 문자열로 변환
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  useEffect(() => {
    const loadWeekData = async () => {
      const today = new Date();
      
      // 기준이 되는 월요일 계산
      let baseMonday = getMonday(today);
      
      // 주간 오프셋 적용
      baseMonday.setDate(baseMonday.getDate() + (currentWeekOffset * 7));
      
      // 월~금 날짜 배열 생성
      const weekDays = getWeekDays(baseMonday);
      
      // API 요청을 위한 시작일과 종료일
      const startDate = weekDays[0];
      const endDate = weekDays[4];

      // 날짜 계산 디버깅
      console.log('날짜 계산 디버깅:', {
        오늘: today.toISOString().split('T')[0],
        기준월요일: baseMonday.toISOString().split('T')[0],
        시작일: startDate.toISOString().split('T')[0],
        종료일: endDate.toISOString().split('T')[0],
        주차오프셋: currentWeekOffset,
        생성된날짜: weekDays.map(d => d.toISOString().split('T')[0])
      });

      const weekData = await fetchMealData(startDate, endDate);
      setWeekData(weekData);
    };

    loadWeekData();
  }, [currentWeekOffset]);

  // 빈 영양 정보 객체
  const emptyNutrition: Nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    vitaminA: 0,
    thiamine: 0,
    riboflavin: 0,
    vitaminC: 0,
    calcium: 0,
    iron: 0
  };

  // 빈 주간 데이터 생성 함수
  const generateEmptyWeekData = (startDate: Date, endDate: Date): MealInfo[] => {
    const weekDays = getWeekDays(startDate);
    return weekDays.map(date => ({
      date: date.toISOString().split('T')[0],
      lunch: ['급식 정보 없음'],
      nutrition: { ...emptyNutrition }
    }));
  };

  // API에서 급식 데이터 가져오기
  const fetchMealData = async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setError(null);

    try {
      const startDateStr = formatDateToString(startDate);
      const endDateStr = formatDateToString(endDate);

      const url = new URL('https://open.neis.go.kr/hub/mealServiceDietInfo');
      url.searchParams.append('Type', 'json');
      url.searchParams.append('pIndex', '1');
      url.searchParams.append('pSize', '100');
      url.searchParams.append('ATPT_OFCDC_SC_CODE', 'J10');
      url.searchParams.append('SD_SCHUL_CODE', '7751034');
      url.searchParams.append('MLSV_FROM_YMD', startDateStr);
      url.searchParams.append('MLSV_TO_YMD', endDateStr);

      console.log('API 요청 URL:', url.toString());
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('급식 정보를 가져오는데 실패했습니다.');
      }

      const data: NeisApiResponse = await response.json();
      console.log('API 응답 데이터:', data);

      const mealDataMap = new Map<string, MealInfo>();

      if (data.mealServiceDietInfo) {
        for (const info of data.mealServiceDietInfo) {
          if (info.row) {
            for (const item of info.row) {
              const date = `${item.MLSV_YMD.slice(0, 4)}-${item.MLSV_YMD.slice(4, 6)}-${item.MLSV_YMD.slice(6, 8)}`;
              
              // 영양 정보 파싱 전 로깅
              console.log('급식 데이터 처리:', {
                날짜: date,
                메뉴: item.DDISH_NM,
                영양정보_원본: item.NTR_INFO,
                열량정보: item.CAL_INFO
              });

              // CAL_INFO에서 열량 추출
              let calories = 0;
              if (item.CAL_INFO) {
                const calMatch = item.CAL_INFO.match(/[\d.]+/);
                calories = calMatch ? parseFloat(calMatch[0]) : 0;
              }

              // 나머지 영양 정보 파싱
              const nutrition = parseNutrition(item.NTR_INFO);
              
              // CAL_INFO의 열량 값으로 덮어쓰기
              nutrition.calories = calories;

              const mealInfo: MealInfo = {
                date,
                lunch: parseMealMenu(item.DDISH_NM),
                nutrition: nutrition
              };

              // 파싱된 데이터 확인
              console.log('파싱된 급식 정보:', {
                날짜: date,
                메뉴: mealInfo.lunch,
                영양정보: mealInfo.nutrition
              });

              mealDataMap.set(date, mealInfo);
            }
          }
        }
      }

      const weekDays = getWeekDays(startDate);
      const weekData = weekDays.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        return mealDataMap.get(dateStr) || {
          date: dateStr,
          lunch: ['급식 정보 없음'],
          nutrition: { ...emptyNutrition }
        };
      });

      return weekData;
    } catch (err) {
      console.error('급식 데이터 가져오기 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      return generateEmptyWeekData(startDate, endDate);
    } finally {
      setIsLoading(false);
    }
  };

  const isToday = (date: string) => {
    const today = new Date();
    const mealDate = new Date(date);
    return today.toDateString() === mealDate.toDateString();
  };

  const toggleNutrition = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  const handlePrevWeek = () => {
    setCurrentWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  // 주차 계산 함수 수정
  const getWeekNumber = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const firstWeek = Math.ceil((firstDayOfMonth.getDay() + 1) / 7);
    const currentWeek = Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
    return currentWeek;
  };

  // 오늘 날짜가 주말인지 확인하는 함수
  const isWeekend = () => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 || day === 6;
  };

  // 다음 주 월요일 날짜 계산 함수
  const getNextMonday = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const nextMonday = new Date(today);
    
    let daysUntilNextMonday;
    if (currentDay === 6) { // 토요일
      daysUntilNextMonday = 2;
    } else if (currentDay === 0) { // 일요일
      daysUntilNextMonday = 1;
    } else {
      daysUntilNextMonday = 8 - currentDay;
    }
    
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    return nextMonday;
  };

  // 주간 데이터 생성 (월요일부터 금요일까지)
  const generateWeekDays = (baseDate: Date): Date[] => {
    const weekDays: Date[] = [];
    const startDate = new Date(baseDate);
    
    // 현재 요일 구하기 (0: 일요일, 1: 월요일, ..., 6: 토요일)
    const currentDay = startDate.getDay();
    
    // 월요일로 조정
    let mondayOffset;
    if (currentDay === 6) { // 토요일
      mondayOffset = 2; // 다음 주 월요일까지 2일
    } else if (currentDay === 0) { // 일요일
      mondayOffset = 1; // 다음 주 월요일까지 1일
    } else {
      mondayOffset = 1 - currentDay; // 이번 주 월요일까지의 날짜
    }
    
    // 시작일을 월요일로 설정
    startDate.setDate(startDate.getDate() + mondayOffset);
    
    // 주간 오프셋 적용
    startDate.setDate(startDate.getDate() + (currentWeekOffset * 7));
    
    // 종료일 계산 (금요일)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4);
    
    // 시작일부터 종료일까지의 모든 날짜 생성
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      weekDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return weekDays;
  };

  // 주차 정보 표시를 위한 함수들
  const getWeekInfo = (date: Date) => {
    const month = date.getMonth() + 1;
    const weekNumber = getWeekNumber(date);
    const monday = getMonday(date);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    return {
      month,
      weekNumber,
      monday,
      friday
    };
  };

  // 날짜를 한글로 포맷팅하는 함수
  const formatDateKorean = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  // 기준 날짜 설정 (weekData가 비어있을 경우 현재 날짜 사용)
  const baseDate = weekData[0]?.date ? new Date(weekData[0].date) : new Date();
  const weekInfo = getWeekInfo(baseDate);

  return (
    <div className="space-y-6">
      {/* 주간 네비게이션 */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex justify-between items-center w-full mb-4">
          <button
            onClick={handlePrevWeek}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>지난주 급식</span>
          </button>
          <button
            onClick={handleNextWeek}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>다음주 급식</span>
            <span>→</span>
          </button>
        </div>
        
        {/* 주차 정보 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-400 mb-2">
            {weekInfo.month}월 {weekInfo.weekNumber}주차
          </h2>
          <p className="text-gray-400">
            {formatDateKorean(weekInfo.monday)} ~ {formatDateKorean(weekInfo.friday)}
          </p>
        </div>
      </div>

      {/* 급식 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-400">로딩 중...</span>
          </div>
        ) : (
          weekData.map((mealData, index) => {
            const date = new Date(mealData.date);
            const dateStr = mealData.date;
            const isCurrentDay = isToday(dateStr);

            return (
              <div 
                key={index} 
                className={`rounded-lg p-4 shadow-lg transition-all duration-200 relative flex flex-col h-full ${
                  isCurrentDay 
                    ? 'bg-indigo-900 border-2 border-indigo-400 transform scale-102' 
                    : 'bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                <h3 className={`text-lg font-bold mb-3 ${
                  isCurrentDay ? 'text-indigo-300' : 'text-indigo-400'
                }`}>
                  {formatDateKorean(date)}
                </h3>
                
                {/* 점심 메뉴 */}
                <div className="flex-grow mb-4">
                  <h4 className={`text-lg font-semibold mb-2 ${
                    isCurrentDay ? 'text-gray-200' : 'text-gray-300'
                  }`}>점심</h4>
                  <ul className="space-y-1">
                    {mealData.lunch.map((item, idx) => (
                      <li 
                        key={idx} 
                        className={isCurrentDay ? 'text-gray-300' : 'text-gray-400'}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 영양 정보 버튼 */}
                <div className="relative mt-auto">
                  <button
                    onClick={() => toggleNutrition(dateStr)}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      isCurrentDay
                        ? 'bg-indigo-700 hover:bg-indigo-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'
                    }`}
                  >
                    영양 보기
                  </button>

                  {/* 영양 정보 말풍선 */}
                  {selectedDate === dateStr && (
                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-zinc-700 rounded-lg p-4 shadow-xl z-10">
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-zinc-700"></div>
                      <h4 className="text-lg font-semibold text-indigo-400 mb-2">영양 정보</h4>
                      <div className="space-y-1 text-sm text-gray-200">
                        <p>열량: {mealData.nutrition.calories} kcal</p>
                        <p>탄수화물: {mealData.nutrition.carbs}g</p>
                        <p>단백질: {mealData.nutrition.protein}g</p>
                        <p>지방: {mealData.nutrition.fat}g</p>
                        <div className="mt-2 pt-2 border-t border-zinc-600">
                          <p>비타민A: {mealData.nutrition.vitaminA} R.E</p>
                          <p>티아민: {mealData.nutrition.thiamine}mg</p>
                          <p>리보플라빈: {mealData.nutrition.riboflavin}mg</p>
                          <p>비타민C: {mealData.nutrition.vitaminC}mg</p>
                          <p>칼슘: {mealData.nutrition.calcium}mg</p>
                          <p>철분: {mealData.nutrition.iron}mg</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 