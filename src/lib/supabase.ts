import { createClient } from '@supabase/supabase-js';

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 환경 변수가 있으면 실제 Supabase 클라이언트 생성
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false
    }
  }
);

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

export type TuitionFee = {
  id: string;
  academy_name: string;
  amount: number;
  due_date: number;
  is_monthly: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  tuition_payments?: TuitionPayment[];
};

export type TuitionPayment = {
  id: string;
  tuition_fee_id: string;
  year: number;
  month: number;
  paid_at: string;
}; 