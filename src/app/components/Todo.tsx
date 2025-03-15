"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TodoItem from "./TodoItem";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { fetchTodos, addTodo, toggleTodo, updateTodoText, deleteTodo } from "@/services/todoService";
import { Todo as TodoType } from "@/lib/supabase";

type FilterType = "all" | "active" | "completed";

export default function Todo() {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 할일 목록 불러오기
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTodos();
        setTodos(data);
      } catch (err) {
        setError("할일 목록을 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, []);

  // 할일 추가
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const newTodo = await addTodo(inputValue);
      setTodos((prev) => [newTodo, ...prev]);
      setInputValue("");
    } catch (err) {
      setError("할일을 추가하는데 실패했습니다.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 할일 상태 토글
  const handleToggleTodo = async (id: number) => {
    try {
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) {
        console.error(`ID가 ${id}인 할일을 찾을 수 없습니다.`);
        return;
      }

      console.log(`할일 토글 시작 - ID: ${id}, 현재 상태: ${todoToToggle.is_completed}, 변경할 상태: ${!todoToToggle.is_completed}`);
      
      setError(null);
      // 낙관적 UI 업데이트
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, is_completed: !todo.is_completed } : todo
        )
      );

      console.log(`toggleTodo 함수 호출 - ID: ${id}, 새 상태: ${!todoToToggle.is_completed}`);
      const updatedTodo = await toggleTodo(id, !todoToToggle.is_completed);
      console.log('토글 결과:', updatedTodo);
    } catch (err) {
      console.error('할일 상태 토글 중 오류 발생:', err);
      // 실패 시 원래 상태로 되돌리기
      const data = await fetchTodos();
      setTodos(data);
      setError("할일 상태를 변경하는데 실패했습니다.");
      console.error(err);
    }
  };

  // 할일 수정
  const handleEditTodo = async (id: number, newText: string) => {
    try {
      setError(null);
      // 낙관적 UI 업데이트
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, task: newText } : todo
        )
      );

      await updateTodoText(id, newText);
    } catch (err) {
      // 실패 시 원래 상태로 되돌리기
      const data = await fetchTodos();
      setTodos(data);
      setError("할일을 수정하는데 실패했습니다.");
      console.error(err);
    }
  };

  // 할일 삭제
  const handleDeleteTodo = async (id: number) => {
    try {
      setError(null);
      // 낙관적 UI 업데이트
      const previousTodos = [...todos];
      setTodos(prev => prev.filter(todo => todo.id !== id));

      await deleteTodo(id);
    } catch (err) {
      // 실패 시 원래 상태로 되돌리기
      const data = await fetchTodos();
      setTodos(data);
      setError("할일을 삭제하는데 실패했습니다.");
      console.error(err);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.is_completed;
    if (filter === "completed") return todo.is_completed;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.is_completed).length;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white">할 일 목록</h2>
          <motion.div
            animate={{ scale: activeTodosCount > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="px-3 py-1 bg-zinc-800 rounded-full"
          >
            <span className="text-sm text-blue-400">
              남은 할 일: {activeTodosCount}개
            </span>
          </motion.div>
        </motion.div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="할 일을 입력하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!inputValue.trim() || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            추가
          </Button>
        </form>

        <div className="flex gap-1 mb-4">
          {["all", "active", "completed"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as FilterType)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === filterType
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {filterType === "all" ? "전체" : filterType === "active" ? "미완료" : "완료"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  id={todo.id}
                  text={todo.task}
                  isDone={todo.is_completed}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  onEdit={handleEditTodo}
                />
              ))}
              {filteredTodos.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 text-zinc-400"
                >
                  {filter === "all" 
                    ? "할 일이 없습니다." 
                    : filter === "active" 
                      ? "미완료된 할 일이 없습니다."
                      : "완료된 할 일이 없습니다."}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 