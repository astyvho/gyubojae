"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TuitionFee {
  id: string;
  academyName: string;
  amount: number;
  dueDate: number;
  isMonthly: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  payments: {
    year: number;
    month: number;
    paidAt: string;
  }[];
}

export default function EditTuitionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [formData, setFormData] = useState({
    academyName: "",
    amount: "",
    dueDate: "1",
  });

  useEffect(() => {
    const savedFees = localStorage.getItem("tuitionFees");
    if (savedFees) {
      const fees = JSON.parse(savedFees);
      const fee = fees.find((f: TuitionFee) => f.id === id);
      if (fee) {
        setFormData({
          academyName: fee.academyName,
          amount: fee.amount.toString(),
          dueDate: fee.dueDate.toString(),
        });
      }
    }
  }, [id]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const numberValue = Number(value);
      setFormData({
        ...formData,
        amount: numberValue.toLocaleString()
      });
    } else {
      setFormData({
        ...formData,
        amount: ""
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const savedFees = localStorage.getItem("tuitionFees");
    if (savedFees) {
      const fees = JSON.parse(savedFees);
      const updatedFees = fees.map((fee: TuitionFee) => {
        if (fee.id === id) {
          return {
            ...fee,
            academyName: formData.academyName,
            amount: Number(formData.amount.replace(/,/g, '')),
            dueDate: Number(formData.dueDate),
          };
        }
        return fee;
      });
      
      localStorage.setItem("tuitionFees", JSON.stringify(updatedFees));
      router.push("/mom-working");
    }
  };

  return (
    <main className="min-h-screen p-8 bg-zinc-950">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/mom-working"
            className="text-gray-400 hover:text-purple-400 transition-colors mr-4"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-purple-400">학원비 수정</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-purple-400">학원비 정보 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="academyName" className="text-gray-200">학원 이름</Label>
                <Input
                  id="academyName"
                  value={formData.academyName}
                  onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 h-12 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-200">월 학원비</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-200">₩</span>
                  <Input
                    id="amount"
                    type="text"
                    value={formData.amount}
                    onChange={handleAmountChange}
                    className="bg-zinc-800 border-zinc-700 h-12 pl-8 text-white"
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-gray-200">납부일</Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 h-12 text-white"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  수정하기
                </Button>
                <Link href="/mom-working" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    취소
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 