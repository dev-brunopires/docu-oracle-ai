import React from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ConversationList({ conversations, currentConversationId, onSelect }) {
  return (
    <div className="p-3 space-y-2">
      {conversations.map((conv) => (
        <motion.button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
            currentConversationId === conv.id
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-3">
            <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">{conv.title}</p>
              <p className={`text-xs mt-1 ${
                currentConversationId === conv.id ? 'text-white/80' : 'text-slate-500'
              }`}>
                {conv.last_message_at && format(new Date(conv.last_message_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        </motion.button>
      ))}
      {conversations.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma conversa ainda</p>
        </div>
      )}
    </div>
  );
}