import { createClient } from '@supabase/supabase-js';

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수가 설정되어 있는지 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '설정되지 않음');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '설정되지 않음');
}

// 개발 환경에서만 환경 변수 확인 (보안을 위해 실제 값은 출력하지 않음)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL 설정됨:', !!supabaseUrl);
  console.log('Supabase URL 길이:', supabaseUrl?.length || 0);
  console.log('Supabase Anon Key 설정됨:', !!supabaseAnonKey);
  console.log('Supabase Anon Key 길이:', supabaseAnonKey?.length || 0);
  
  // URL 형식 확인
  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
      console.log('Supabase URL 형식 유효');
    } catch (e) {
      console.error('Supabase URL 형식 오류:', e);
    }
  }
}

// 환경 변수가 없는 경우를 위한 더미 클라이언트
let supabase;

// 환경 변수가 있으면 실제 Supabase 클라이언트 생성
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
} else {
  // 환경 변수가 없으면 더미 클라이언트 생성
  console.warn('환경 변수가 없어 더미 Supabase 클라이언트를 사용합니다.');
  
  // 더미 클라이언트 생성 (메서드는 있지만 실제로는 동작하지 않음)
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          then: () => Promise.resolve({ data: [], error: null }),
          catch: () => Promise.resolve({ data: [], error: null }),
        }),
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      limit: () => Promise.resolve({ data: [], error: null }),
    }),
  };
}

// 타입 정의
export interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

// Supabase 테이블 이름
export const TODOS_TABLE = 'todos';

// Supabase 클라이언트 내보내기
export { supabase }; 