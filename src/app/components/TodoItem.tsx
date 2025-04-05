"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface TodoItemProps {
  id: number;
  text: string;
  isDone: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
}

const TodoItem = forwardRef<HTMLDivElement, TodoItemProps>(({
  id,
  text,
  isDone,
  onToggle,
  onDelete,
  onEdit,
}, ref) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleEdit = () => {
    if (editText.trim() === "") return;
    onEdit(id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg group"
    >
      {!isEditing && (
        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggle(id)}
          className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      )}
      
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="bg-zinc-700 border-zinc-600 text-white"
            autoFocus
          />
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleEdit}
            className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleCancel}
            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <span
            className={`flex-1 ${
              isDone 
                ? "line-through text-zinc-500" 
                : "text-white"
            }`}
          >
            {text}
          </span>
          <div className="flex gap-6">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
              disabled={isDone}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onDelete(id)}
              className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem; 