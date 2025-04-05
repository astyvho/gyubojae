"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Check, X, Pencil, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SchoolMeal from "../../../components/SchoolMeal";
import Link from "next/link";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
  created_at: string;
}

export default function GyubojaeSchoolMealPage() {
  const [activeTab, setActiveTab] = useState<'todo' | 'meal'>('todo');
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [todoFilter, setTodoFilter] = useState<'all' | 'active' | 'completed'>('all');

  // 할일 목록 가져오기
  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('moms_todos')
        .select('*')
        .eq('user_id', '1')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
        return;
      }

      setTodoItems(data || []);
    } catch (error) {
      console.error('Error in fetchTodos:', error);
    }
  };

  // 할일 추가
  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const { data, error } = await supabase
        .from('moms_todos')
        .insert([
          {
            title: newTodo.trim(),
            completed: false,
            user_id: '1'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding todo:', error);
        return;
      }

      setTodoItems([data, ...todoItems]);
      setNewTodo("");
    } catch (error) {
      console.error('Error in handleAddTodo:', error);
    }
  };

  // 할일 삭제
  const handleDeleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('moms_todos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting todo:', error);
        return;
      }

      setTodoItems(todoItems.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error in handleDeleteTodo:', error);
    }
  };

  // 할일 완료/미완료 토글
  const handleToggleTodo = async (id: string) => {
    try {
      const todo = todoItems.find(t => t.id === id);
      if (!todo) return;

      const { error } = await supabase
        .from('moms_todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) {
        console.error('Error toggling todo:', error);
        return;
      }

      setTodoItems(todoItems.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error in handleToggleTodo:', error);
    }
  };

  // 할일 수정
  const handleEditTodo = async (id: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('moms_todos')
        .update({ title: editText.trim() })
        .eq('id', id);

      if (error) {
        console.error('Error editing todo:', error);
        return;
      }

      setTodoItems(todoItems.map(t => 
        t.id === id ? { ...t, title: editText.trim() } : t
      ));
      setEditingTodo(null);
      setEditText("");
    } catch (error) {
      console.error('Error in handleEditTodo:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/school-meal"
            className="text-gray-400 hover:text-purple-400 transition-colors mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-purple-400">규백's 급식알리미</h1>
        </div>

        <Tabs defaultValue="todo" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="todo" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              규백 할일
            </TabsTrigger>
            <TabsTrigger 
              value="meal" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              소현중 급식알리미
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-purple-400">할일 목록</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                      placeholder="할일을 입력하세요"
                      className="flex-1 bg-zinc-800 border-zinc-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Button onClick={handleAddTodo} className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex space-x-2 pb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTodoFilter('all')}
                      className={`${
                        todoFilter === 'all'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/20'
                      }`}
                    >
                      전체
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTodoFilter('active')}
                      className={`${
                        todoFilter === 'active'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/20'
                      }`}
                    >
                      미완료
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTodoFilter('completed')}
                      className={`${
                        todoFilter === 'completed'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/20'
                      }`}
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
                          className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                        >
                          {editingTodo === todo.id ? (
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 bg-zinc-700 border-zinc-600 rounded px-2 py-1 text-white"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEditTodo(todo.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTodo(null);
                                  setEditText("");
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-3 flex-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleTodo(todo.id)}
                                  className={`${
                                    todo.completed
                                      ? 'text-purple-400 hover:text-purple-300'
                                      : 'text-gray-400 hover:text-gray-300'
                                  }`}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <span
                                  className={`${
                                    todo.completed
                                      ? 'text-gray-500 line-through'
                                      : 'text-gray-100'
                                  }`}
                                >
                                  {todo.title}
                                </span>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTodo(todo.id);
                                    setEditText(todo.title);
                                  }}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTodo(todo.id)}
                                  className="text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meal">
            <SchoolMeal />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 