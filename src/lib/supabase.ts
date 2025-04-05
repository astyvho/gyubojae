import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 테이블 이름 상수
export const TODOS_TABLE = 'todos';

// Todo 타입 정의
export interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
  created_at: string;
  updated_at?: string;
} 