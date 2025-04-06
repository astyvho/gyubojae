'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

export default function TodoPage() {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [todoFilter, setTodoFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const supabase = createClient();

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('gyubaek_todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
      return;
    }

    setTodoItems(data || []);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    const { data, error } = await supabase
      .from('gyubaek_todos')
      .insert([{ text: newTodo.trim(), completed: false }])
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', error);
      return;
    }

    setTodoItems([data, ...todoItems]);
    setNewTodo('');
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todoItems.find(item => item.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('gyubaek_todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) {
      console.error('Error toggling todo:', error);
      return;
    }

    setTodoItems(todoItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('gyubaek_todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return;
    }

    setTodoItems(todoItems.filter(item => item.id !== id));
  };

  const handleStartEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from('gyubaek_todos')
      .update({ text: editText.trim() })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
      return;
    }

    setTodoItems(todoItems.map(item =>
      item.id === id ? { ...item, text: editText.trim() } : item
    ));
    setEditingId(null);
    setEditText('');
  };

  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-400">규백 할일 목록</h1>
          <Link 
            href="/gyubaeks-space"
            className="text-gray-400 hover:text-indigo-400 transition-colors"
          >
            ← 메인으로 돌아가기
          </Link>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              할일 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="새로운 할일을 입력하세요"
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                />
                <Button 
                  onClick={handleAddTodo} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  추가
                </Button>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setTodoFilter('all')}
                  className={`flex-1 ${todoFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'}`}
                >
                  전체
                </Button>
                <Button
                  onClick={() => setTodoFilter('active')}
                  className={`flex-1 ${todoFilter === 'active' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'}`}
                >
                  미완료
                </Button>
                <Button
                  onClick={() => setTodoFilter('completed')}
                  className={`flex-1 ${todoFilter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'}`}
                >
                  완료
                </Button>
              </div>

              <div className="space-y-2">
                {todoItems
                  .filter(todo => {
                    if (todoFilter === 'active') return !todo.completed;
                    if (todoFilter === 'completed') return todo.completed;
                    return true;
                  })
                  .map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleTodo(todo.id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        {editingId === todo.id ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 bg-zinc-700 border-zinc-600 text-white"
                              autoFocus
                            />
                            <Button
                              onClick={() => handleSaveEdit(todo.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              저장
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              variant="outline"
                              className="text-gray-300 hover:text-white"
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <span className={todo.completed ? 'line-through text-gray-500' : 'text-gray-300'}>
                            {todo.text}
                          </span>
                        )}
                      </div>
                      {editingId !== todo.id && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleStartEdit(todo)}
                            variant="ghost"
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                          >
                            수정
                          </Button>
                          <Button
                            onClick={() => handleDeleteTodo(todo.id)}
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            삭제
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 