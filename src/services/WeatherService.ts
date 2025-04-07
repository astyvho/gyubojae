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
  try {
    console.log('API Key:', process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY); // API 키 확인
    const url = `https://api.openweathermap.org/data/2.5/weather?q=Yongin&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}&units=metric&lang=kr`;
    console.log('Fetching URL:', url); // URL 확인

    const response = await fetch(url);
    console.log('Response status:', response.status); // 응답 상태 확인

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response:', errorData); // 에러 응답 확인
      throw new Error(`날씨 정보를 가져오는데 실패했습니다. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather data:', data); // 응답 데이터 확인
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
} 