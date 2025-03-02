"use client";

import React from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

interface TodoItemProps {
  id: number;
  text: string;
  isDone: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({
  id,
  text,
  isDone,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg group"
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={() => onToggle(id)}
        className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
      <span
        className={`flex-1 ${
          isDone 
            ? "line-through text-zinc-500" 
            : "text-white"
        }`}
      >
        {text}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="px-2 py-1 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all"
      >
        삭제
      </button>
    </motion.div>
  );
} 