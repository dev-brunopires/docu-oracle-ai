import React from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, MessageCircle, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function EmptyChat() {
  const suggestions = [
    { icon: BookOpen, text: "Como criar um relatório mensal?", color: "from-blue-500 to-cyan-500" },
    { icon: MessageCircle, text: "Qual o procedimento para férias?", color: "from-purple-500 to-pink-500" },
    { icon: Zap, text: "Como solicitar reembolso?", color: "from-orange-500 to-red-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo ao Oráculo</h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        Pergunte qualquer coisa sobre os procedimentos da empresa. Estou aqui para ajudar!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group bg-white/80 backdrop-blur-sm">
              <div className={`w-10 h-10 bg-gradient-to-br ${suggestion.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <suggestion.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-slate-700 font-medium">{suggestion.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}