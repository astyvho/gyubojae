"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TodoItem from "./TodoItem";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Todo {
  id: number;
  text: string;
  isDone: boolean;
}

type FilterType = "all" | "active" | "completed";

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue,
      isDone: false,
    };

    setTodos((prev) => [...prev, newTodo]);
    setInputValue("");
  };

  const handleToggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  const handleDeleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.isDone;
    if (filter === "completed") return todo.isDone;
    return true;
  });

  const activeTodosCount = todos.filter(todo => !todo.isDone).length;

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
        
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="할 일을 입력하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400"
          />
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

        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                {...todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
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
      </CardContent>
    </Card>
  );
} 