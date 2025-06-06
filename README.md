# 영재's space

영재's space는 학원비 관리와 일정 관리를 위한 웹 애플리케이션입니다. Next.js, TailwindCSS, shadcn/ui를 사용하여 개발되었으며, Supabase를 데이터베이스로 사용합니다.

## 주요 기능

### 1. 대시보드
- **통계 정보**
  - 미납 학원비 금액 확인
  - 이번 달 근무일 수 표시
  - 미완료 할 일 개수 표시

- **달력**
  - 근무일 하이라이트 표시 (보라색 배경)
  - 학원비 납부일 표시
  - 오늘 날짜 강조 표시

- **등록된 학원비 목록**
  - 학원명, 금액, 납부일 정보 표시
  - 납부 상태 확인 가능
  - 납입 버튼으로 즉시 납부 처리
  - 수정 및 삭제 기능

- **할 일 목록**
  - 할 일 추가/삭제
  - 완료 상태 토글 기능

### 2. 학원비 등록
- **등록 폼**
  - 학원 이름 입력
  - 월 학원비 금액 입력 (자동 숫자 포맷팅)
  - 납부일 선택 (달력 인터페이스)

- **등록 확인**
  - 입력 정보 최종 확인 다이얼로그
  - 확인/취소 선택 가능

## 기술 스택

- **Frontend**
  - Next.js 14
  - React
  - TailwindCSS
  - shadcn/ui
  - date-fns (날짜 처리)
  - lucide-react (아이콘)

- **Backend**
  - Supabase (데이터베이스)
  - PostgreSQL

## 데이터베이스 구조

### tuition_fees 테이블
```sql
create table tuition_fees (
  id uuid default uuid_generate_v4() primary key,
  academy_name text not null,
  amount integer not null,
  due_date integer not null,
  is_monthly boolean default true,
  user_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### tuition_payments 테이블
```sql
create table tuition_payments (
  id uuid default uuid_generate_v4() primary key,
  tuition_fee_id uuid references tuition_fees(id) on delete cascade,
  year integer not null,
  month integer not null,
  paid_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 환경 설정

1. `.env.local` 파일 생성
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

## UI/UX 특징

- 다크 테마 기반의 모던한 디자인
- 반응형 레이아웃 지원
- 부드러운 애니메이션과 전환 효과
- 사용자 친화적인 인터페이스
- 직관적인 아이콘과 버튼 배치

## 향후 개선 사항

- [ ] 사용자 인증 기능 추가
- [ ] 알림 기능 구현
- [ ] 통계 데이터 시각화 개선
- [ ] 모바일 앱 버전 개발

## 라이선스

MIT License

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
#   m y s p a c e 
 
 