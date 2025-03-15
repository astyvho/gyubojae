/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 빌드 시 ESLint 오류를 무시하도록 설정
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입스크립트 오류를 무시하도록 설정
    ignoreBuildErrors: true,
  },
  env: {
    // 환경 변수가 없을 경우 빈 문자열로 설정
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // 정적 내보내기 설정
  output: 'standalone',
};

module.exports = nextConfig; 