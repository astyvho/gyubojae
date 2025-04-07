"use client";

import React, { useEffect, useState } from "react";
import { fetchWeather } from "../services/WeatherService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// 날씨 아이콘 매핑
const weatherIcons: { [key: string]: string } = {
  "01d": "☀️",
  "01n": "🌙",
  "02d": "⛅",
  "02n": "☁️",
  "03d": "☁️",
  "03n": "☁️",
  "04d": "☁️",
  "04n": "☁️",
  "09d": "🌧️",
  "09n": "🌧️",
  "10d": "🌦️",
  "10n": "🌧️",
  "11d": "⛈️",
  "11n": "⛈️",
  "13d": "🌨️",
  "13n": "🌨️",
  "50d": "🌫️",
  "50n": "🌫️"
};

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

export default function Weather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getWeather = async () => {
      try {
        const data = await fetchWeather();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError("날씨 정보를 가져올 수 없습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getWeather();
  }, []);

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-400">용인시 수지구 날씨</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Skeleton className="h-16 w-16 bg-zinc-800" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-24 bg-zinc-800" />
              <Skeleton className="h-4 w-32 bg-zinc-800" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-zinc-900 border-red-800">
        <CardHeader>
          <CardTitle className="text-red-400">오류 발생</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
          <p className="text-sm text-red-500 mt-2">
            OpenWeatherMap API 키를 확인해주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  const weatherIcon = weatherIcons[weatherData.weather[0]?.icon] || "🌈";

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-400">용인시 수지구 날씨</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="text-6xl">{weatherIcon}</div>
          <div>
            <p className="text-4xl font-bold text-blue-400">
              {weatherData.main.temp.toFixed(1)}°
            </p>
            <p className="text-sm text-zinc-500">
              {weatherData.weather[0]?.description}
            </p>
            <div className="flex gap-3 mt-2">
              <p className="text-xs text-zinc-600">
                체감 {weatherData.main.feels_like.toFixed(1)}°
              </p>
              <p className="text-xs text-zinc-600">
                습도 {weatherData.main.humidity}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 