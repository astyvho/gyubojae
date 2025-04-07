interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export async function fetchWeather(): Promise<WeatherData> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Yongin&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=kr`
  );

  if (!response.ok) {
    throw new Error('날씨 정보를 가져오는데 실패했습니다.');
  }

  return response.json();
} 