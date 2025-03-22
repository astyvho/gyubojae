# 규보재 (Gyubojae)

규보재는 학교 생활을 더 편리하게 만들어주는 종합 학교 생활 관리 웹 애플리케이션입니다.

## 주요 기능

- 학교 급식 정보 조회
  - 주간 급식 메뉴 확인
  - 영양 정보 확인
- 할 일 관리 (Todo)
  - 할 일 추가/수정/삭제
  - 완료 상태 관리
  - 카테고리별 필터링
- 모바일 친화적인 반응형 디자인

## 기술 스택

- **Frontend**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - shadcn/ui

- **API 연동**
  - NEIS Open API (급식 정보)

## 시작하기

1. 저장소 클론
```bash
git clone https://github.com/[your-username]/gyubojae.git
cd gyubojae
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:
```env
NEXT_PUBLIC_NEIS_API_KEY=your_api_key_here
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 확인
```
http://localhost:3000
```

## 프로젝트 구조

```
src/
├── app/                    # 페이지 및 레이아웃
│   ├── components/        # 공통 컴포넌트
│   ├── school-meal/      # 급식 정보 페이지
│   └── todo/             # 할 일 관리 페이지
├── components/            # UI 컴포넌트
├── lib/                   # 유틸리티 함수
└── services/             # API 서비스
```

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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