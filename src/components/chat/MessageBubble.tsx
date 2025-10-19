import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-slate-200' 
          : 'bg-gradient-to-br from-blue-600 to-emerald-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-slate-600" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>
      
      <div className="flex-1 max-w-3xl">
        <Card className={`p-4 ${
          isUser 
            ? 'bg-slate-100 border-slate-200' 
            : 'bg-white/80 backdrop-blur-sm border-slate-200'
        }`}>
          <div className="prose prose-sm max-w-none">
            {isUser ? (
              <p className="text-slate-900">{message.content}</p>
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="text-slate-900 mb-3 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                  code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Fontes consultadas:
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {source.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}