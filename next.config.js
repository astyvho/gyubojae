/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 빌드 시 경고는 허용하고 오류만 실패하도록 설정
    ignoreDuringBuilds: false,
  },
  env: {
    // 환경 변수가 없을 경우 빈 문자열로 설정
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
};

module.exports = nextConfig; 