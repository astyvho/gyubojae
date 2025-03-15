import { supabase, TODOS_TABLE, Todo } from '@/lib/supabase';

// Supabase 연결 테스트
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('Supabase 연결 테스트 중...');
    console.log('테이블 이름:', TODOS_TABLE);
    
    // 직접 todos 테이블 접근 시도
    console.log('todos 테이블 접근 시도...');
    const { data, error } = await supabase
      .from(TODOS_TABLE)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase 연결 테스트 실패:', error);
      console.error('오류 코드:', error.code);
      console.error('오류 메시지:', error.message);
      console.error('오류 상세:', error.details);
      
      // RLS 관련 오류인지 확인
      if (error.message?.includes('permission denied') || error.code === 'PGRST301') {
        console.error('RLS(Row Level Security) 오류일 수 있습니다. Supabase 대시보드에서 RLS 설정을 확인하세요.');
      } else if (error.message?.includes('does not exist') || error.code === 'PGRST301') {
        console.error('테이블이 존재하지 않습니다. Supabase 대시보드에서 테이블을 생성하세요.');
      }
      
      return false;
    }
    
    console.log('Supabase 연결 테스트 성공:', data);
    return true;
  } catch (error) {
    console.error('Supabase 연결 테스트 중 예외 발생:', error);
    return false;
  }
}

// 모든 할일 가져오기
export async function fetchTodos(): Promise<Todo[]> {
  try {
    // 먼저 연결 테스트
    const connected = await testSupabaseConnection();
    if (!connected) {
      console.warn('Supabase 연결 테스트 실패, 빈 배열 반환');
      return [];
    }
    
    const { data, error } = await supabase
      .from(TODOS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 오류:', error);
      throw error;
    }

    console.log('할일 목록 가져오기 성공:', data);
    return data || [];
  } catch (error) {
    console.error('할일 목록을 가져오는데 실패했습니다:', error);
    throw error;
  }
}

// 새 할일 추가하기
export async function addTodo(text: string): Promise<Todo> {
  try {
    // 날짜 필드를 제거하고 Supabase가 자동으로 처리하도록 함
    const newTodo = {
      task: text,
      is_completed: false,
      // created_at과 updated_at은 Supabase가 자동으로 처리하도록 제거
    };

    console.log('할일 추가 시도:', newTodo);
    
    const { data, error } = await supabase
      .from(TODOS_TABLE)
      .insert([newTodo])
      .select()
      .single();

    if (error) {
      console.error('Supabase 오류 상세:', error);
      console.error('오류 코드:', error.code);
      console.error('오류 메시지:', error.message);
      console.error('오류 상세:', error.details);
      
      // RLS 관련 오류인지 확인
      if (error.message?.includes('permission denied') || error.code === 'PGRST301') {
        console.error('RLS(Row Level Security) 오류일 수 있습니다. Supabase 대시보드에서 RLS 설정을 확인하세요.');
      } else if (error.message?.includes('does not exist') || error.code === 'PGRST301') {
        console.error('테이블이 존재하지 않습니다. Supabase 대시보드에서 테이블을 생성하세요.');
      } else if (error.message?.includes('violates not-null constraint')) {
        console.error('필수 필드가 누락되었습니다. 테이블 구조를 확인하세요.');
      }
      
      throw error;
    }

    if (!data) {
      throw new Error('데이터가 반환되지 않았습니다.');
    }

    console.log('할일 추가 성공:', data);
    return data;
  } catch (error) {
    console.error('할일을 추가하는데 실패했습니다:', error);
    throw error;
  }
}

// 할일 상태 토글하기
export async function toggleTodo(id: number, isCompleted: boolean): Promise<Todo> {
  try {
    console.log(`할일 상태 토글 시도 - ID: ${id}, 완료 상태: ${isCompleted}`);
    
    // 먼저 현재 상태 확인
    const { data: currentTodo, error: fetchError } = await supabase
      .from(TODOS_TABLE)
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('현재 할일 상태 확인 실패:', fetchError);
      throw fetchError;
    }
    
    console.log('현재 할일 상태:', currentTodo);
    
    // 상태 업데이트
    const updateData = {
      is_completed: isCompleted,
      updated_at: new Date().toISOString() // 명시적으로 updated_at 설정
    };
    
    console.log('업데이트할 데이터:', updateData);
    
    const { data, error } = await supabase
      .from(TODOS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase 오류:', error);
      console.error('오류 코드:', error.code);
      console.error('오류 메시지:', error.message);
      console.error('오류 상세:', error.details);
      
      // RLS 관련 오류인지 확인
      if (error.message?.includes('permission denied') || error.code === 'PGRST301') {
        console.error('RLS(Row Level Security) 오류일 수 있습니다. Supabase 대시보드에서 RLS 설정을 확인하세요.');
      }
      
      throw error;
    }

    if (!data) {
      throw new Error('데이터가 반환되지 않았습니다.');
    }

    console.log('할일 상태 토글 성공:', data);
    return data;
  } catch (error) {
    console.error('할일 상태를 변경하는데 실패했습니다:', error);
    throw error;
  }
}

// 할일 수정하기
export async function updateTodoText(id: number, text: string): Promise<Todo> {
  try {
    console.log(`할일 텍스트 수정 시도 - ID: ${id}, 새 텍스트: ${text}`);
    
    const updateData = {
      task: text,
      updated_at: new Date().toISOString() // 명시적으로 updated_at 설정
    };
    
    const { data, error } = await supabase
      .from(TODOS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase 오류:', error);
      console.error('오류 코드:', error.code);
      console.error('오류 메시지:', error.message);
      console.error('오류 상세:', error.details);
      
      // RLS 관련 오류인지 확인
      if (error.message?.includes('permission denied') || error.code === 'PGRST301') {
        console.error('RLS(Row Level Security) 오류일 수 있습니다. Supabase 대시보드에서 RLS 설정을 확인하세요.');
      }
      
      throw error;
    }

    if (!data) {
      throw new Error('데이터가 반환되지 않았습니다.');
    }

    console.log('할일 텍스트 수정 성공:', data);
    return data;
  } catch (error) {
    console.error('할일을 수정하는데 실패했습니다:', error);
    throw error;
  }
}

// 할일 삭제하기
export async function deleteTodo(id: number): Promise<void> {
  try {
    console.log(`할일 삭제 시도 - ID: ${id}`);
    
    const { error } = await supabase
      .from(TODOS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase 오류:', error);
      console.error('오류 코드:', error.code);
      console.error('오류 메시지:', error.message);
      console.error('오류 상세:', error.details);
      
      // RLS 관련 오류인지 확인
      if (error.message?.includes('permission denied') || error.code === 'PGRST301') {
        console.error('RLS(Row Level Security) 오류일 수 있습니다. Supabase 대시보드에서 RLS 설정을 확인하세요.');
      }
      
      throw error;
    }
    
    console.log('할일 삭제 성공');
  } catch (error) {
    console.error('할일을 삭제하는데 실패했습니다:', error);
    throw error;
  }
} 