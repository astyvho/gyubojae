import { supabase, TODOS_TABLE, Todo } from '@/lib/supabase';

// 정적 데이터 (환경 변수가 없을 때 사용)
const staticTodos: Todo[] = [
  {
    id: 1,
    task: '정적 데이터: 환경 변수를 설정해주세요',
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    task: 'Vercel에서 환경 변수 설정하기',
    is_completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    task: 'Supabase 연결 확인하기',
    is_completed: false,
    created_at: new Date().toISOString(),
  }
];

// 환경 변수 확인
const hasEnvVars = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase 연결 테스트
export async function testSupabaseConnection(): Promise<boolean> {
  // 환경 변수가 없으면 연결 테스트 실패로 간주
  if (!hasEnvVars) {
    console.warn('환경 변수가 없어 Supabase 연결 테스트를 건너뜁니다.');
    return false;
  }

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
  // 환경 변수가 없으면 정적 데이터 반환
  if (!hasEnvVars) {
    console.warn('환경 변수가 없어 정적 데이터를 반환합니다.');
    return staticTodos;
  }

  try {
    // 먼저 연결 테스트
    const connected = await testSupabaseConnection();
    if (!connected) {
      console.warn('Supabase 연결 테스트 실패, 정적 데이터 반환');
      return staticTodos;
    }
    
    const { data, error } = await supabase
      .from(TODOS_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase 오류:', error);
      return staticTodos; // 오류 발생 시 정적 데이터 반환
    }

    console.log('할일 목록 가져오기 성공:', data);
    return data || [];
  } catch (error) {
    console.error('할일 목록을 가져오는데 실패했습니다:', error);
    return staticTodos; // 예외 발생 시 정적 데이터 반환
  }
}

// 새 할일 추가하기
export async function addTodo(text: string): Promise<Todo> {
  // 환경 변수가 없으면 정적 데이터에 추가
  if (!hasEnvVars) {
    console.warn('환경 변수가 없어 정적 데이터에 추가합니다.');
    const newTodo: Todo = {
      id: staticTodos.length > 0 ? Math.max(...staticTodos.map(t => t.id)) + 1 : 1,
      task: text,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    staticTodos.unshift(newTodo);
    return newTodo;
  }

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
      
      // 오류 발생 시 정적 데이터에 추가
      const fallbackTodo: Todo = {
        id: staticTodos.length > 0 ? Math.max(...staticTodos.map(t => t.id)) + 1 : 1,
        task: text,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      staticTodos.unshift(fallbackTodo);
      return fallbackTodo;
    }

    if (!data) {
      // 데이터가 없으면 정적 데이터에 추가
      const fallbackTodo: Todo = {
        id: staticTodos.length > 0 ? Math.max(...staticTodos.map(t => t.id)) + 1 : 1,
        task: text,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      staticTodos.unshift(fallbackTodo);
      return fallbackTodo;
    }

    console.log('할일 추가 성공:', data);
    return data;
  } catch (error) {
    console.error('할일을 추가하는데 실패했습니다:', error);
    // 예외 발생 시 정적 데이터에 추가
    const fallbackTodo: Todo = {
      id: staticTodos.length > 0 ? Math.max(...staticTodos.map(t => t.id)) + 1 : 1,
      task: text,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    staticTodos.unshift(fallbackTodo);
    return fallbackTodo;
  }
}

// 할일 상태 토글하기
export async function toggleTodo(id: number, isCompleted: boolean): Promise<Todo> {
  // 환경 변수가 없으면 정적 데이터 업데이트
  if (!hasEnvVars) {
    console.warn('환경 변수가 없어 정적 데이터를 업데이트합니다.');
    const todoIndex = staticTodos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      staticTodos[todoIndex].is_completed = isCompleted;
      staticTodos[todoIndex].updated_at = new Date().toISOString();
      return staticTodos[todoIndex];
    }
    throw new Error('할일을 찾을 수 없습니다.');
  }

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
      // 정적 데이터에서 찾아 업데이트
      const todoIndex = staticTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        staticTodos[todoIndex].is_completed = isCompleted;
        staticTodos[todoIndex].updated_at = new Date().toISOString();
        return staticTodos[todoIndex];
      }
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
      
      // 정적 데이터에서 찾아 업데이트
      const todoIndex = staticTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        staticTodos[todoIndex].is_completed = isCompleted;
        staticTodos[todoIndex].updated_at = new Date().toISOString();
        return staticTodos[todoIndex];
      }
      throw error;
    }

    if (!data) {
      // 정적 데이터에서 찾아 업데이트
      const todoIndex = staticTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        staticTodos[todoIndex].is_completed = isCompleted;
        staticTodos[todoIndex].updated_at = new Date().toISOString();
        return staticTodos[todoIndex];
      }
      throw new Error('데이터가 반환되지 않았습니다.');
    }

    console.log('할일 상태 토글 성공:', data);
    return data;
  } catch (error) {
    console.error('할일 상태를 변경하는데 실패했습니다:', error);
    // 정적 데이터에서 찾아 업데이트
    const todoIndex = staticTodos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      staticTodos[todoIndex].is_completed = isCompleted;
      staticTodos[todoIndex].updated_at = new Date().toISOString();
      return staticTodos[todoIndex];
    }
    throw error;
  }
}

// 할일 수정하기
export async function updateTodoText(id: number, text: string): Promise<Todo> {
  // 환경 변수가 없으면 정적 데이터 업데이트
  if (!hasEnvVars) {
    console.warn('환경 변수가 없어 정적 데이터를 업데이트합니다.');
    const todoIndex = staticTodos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      staticTodos[todoIndex].task = text;
      staticTodos[todoIndex].updated_at = new Date().toISOString();
      return staticTodos[todoIndex];
    }
    throw new Error('할일을 찾을 수 없습니다.');
  }

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
      
      // 정적 데이터에서 찾아 업데이트
      const todoIndex = staticTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        staticTodos[todoIndex].task = text;
        staticTodos[todoIndex].updated_at = new Date().toISOString();
        return staticTodos[todoIndex];
      }
      throw error;
    }

    if (!data) {
      // 정적 데이터에서 찾아 업데이트
      const todoIndex = staticTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        staticTodos[todoIndex].task = text;
        staticTodos[todoIndex].updated_at = new Date().toISOString();
        return staticTodos[todoIndex];
      }
      throw new Error('데이터가 반환되지 않았습니다.');
    }

    console.log('할일 텍스트 수정 성공:', data);
    return data;
  } catch (error) {
    console.error('할일을 수정하는데 실패했습니다:', error);
    // 정적 데이터에서 찾아 업데이트
    const todoIndex = staticTodos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      staticTodos[todoIndex].task = text;
      staticTodos[todoIndex].updated_at = new Date().toISOString();
      return staticTodos[todoIndex];
    }
    throw error;
  }
}

// 할일 삭제하기
export async function deleteTodo(id: number): Promise<void> {
  // 환경 변수가 없으면 정적 데이터에서 삭제
  if (!hasEnvVars) {
    console.warn('환경 변수가 없어 정적 데이터에서 삭제합니다.');
    const todoIndex = staticTodos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      staticTodos.splice(todoIndex, 1);
    }
    return;
  }

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
      
      // 정적 데이터에서 삭제
      const todoIndex = staticTodos.findIndex(todo => todo.id === id);
      if (todoIndex !== -1) {
        staticTodos.splice(todoIndex, 1);
      }
      throw error;
    }
    
    console.log('할일 삭제 성공');
  } catch (error) {
    console.error('할일을 삭제하는데 실패했습니다:', error);
    // 정적 데이터에서 삭제
    const todoIndex = staticTodos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
      staticTodos.splice(todoIndex, 1);
    }
    throw error;
  }
} 