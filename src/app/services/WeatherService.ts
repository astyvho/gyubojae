export async function fetchWeather() {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
  // 용인시 수지구 좌표
  const lat = 37.3217;
  const lon = 127.0950;
  
  if (!apiKey) {
    throw new Error("OpenWeatherMap API key is not configured");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;
  
  console.log("Fetching weather data...");
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Error:", errorData);
      throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();
    console.log("Weather data received:", data);
    return data;
  } catch (error) {
    console.error("Weather fetch error:", error);
    throw error;
  }
} 