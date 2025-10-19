import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Plus, MessageSquare, Sparkles, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import ConversationList from "../components/chat/ConversationList";
import MessageBubble from "../components/chat/MessageBubble";
import EmptyChat from "../components/chat/EmptyChat";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.entities.Conversation.filter({ user_email: user?.email }, '-last_message_at'),
    enabled: !!user,
    initialData: [],
  });

  const { data: messages } = useQuery({
    queryKey: ['messages', currentConversationId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: currentConversationId }, 'created_date'),
    enabled: !!currentConversationId,
    initialData: [],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewConversation = async (firstQuestion) => {
    const conversation = await base44.entities.Conversation.create({
      title: firstQuestion.slice(0, 50) + (firstQuestion.length > 50 ? '...' : ''),
      user_email: user.email,
      last_message_at: new Date().toISOString()
    });
    return conversation;
  };

  const findRelevantProcedures = async (question) => {
    const allProcedures = await base44.entities.Procedure.filter({ status: 'active' });
    
    const questionLower = question.toLowerCase();
    const scored = allProcedures.map(proc => {
      let score = 0;
      const titleLower = proc.title?.toLowerCase() || '';
      const contentLower = proc.content_md?.toLowerCase() || '';
      const tagsLower = (proc.tags || []).join(' ').toLowerCase();
      
      if (titleLower.includes(questionLower)) score += 10;
      if (contentLower.includes(questionLower)) score += 5;
      if (tagsLower.includes(questionLower)) score += 3;
      
      const words = questionLower.split(' ').filter(w => w.length > 3);
      words.forEach(word => {
        if (titleLower.includes(word)) score += 3;
        if (contentLower.includes(word)) score += 1;
      });
      
      return { ...proc, score };
    });
    
    return scored
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const askQuestion = async () => {
    if (!question.trim() || isAsking) return;

    setIsAsking(true);
    const userQuestion = question;
    setQuestion("");

    try {
      let conversationId = currentConversationId;
      
      if (!conversationId) {
        const newConv = await createNewConversation(userQuestion);
        conversationId = newConv.id;
        setCurrentConversationId(conversationId);
      }

      await base44.entities.Message.create({
        conversation_id: conversationId,
        role: 'user',
        content: userQuestion
      });

      queryClient.invalidateQueries(['messages', conversationId]);

      const relevantProcedures = await findRelevantProcedures(userQuestion);

      let assistantResponse;
      let sources = [];

      if (relevantProcedures.length === 0) {
        assistantResponse = "Desculpe, não encontrei informações sobre isso nos procedimentos cadastrados. Por favor, verifique se o procedimento existe ou entre em contato com um administrador para cadastrá-lo.";
      } else {
        const context = relevantProcedures.map(proc => 
          `# ${proc.title}\nCategoria: ${proc.category_id || 'Sem categoria'}\n${proc.summary || ''}\n\n${proc.content_md}`
        ).join('\n\n---\n\n');

        const prompt = `Você é o Oráculo de Procedimentos, um assistente especializado em responder perguntas sobre os procedimentos internos da empresa.

PROCEDIMENTOS DISPONÍVEIS:
${context}

REGRAS IMPORTANTES:
1. Responda APENAS com base nos procedimentos fornecidos acima
2. Se a resposta não estiver nos procedimentos, diga claramente que não encontrou a informação
3. Seja claro, objetivo e profissional
4. Use markdown para formatar a resposta (negrito, listas, etc)
5. Se relevante, cite o nome do procedimento usado

PERGUNTA DO USUÁRIO:
${userQuestion}

Responda de forma útil e estruturada:`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          add_context_from_internet: false
        });

        assistantResponse = aiResponse;
        sources = relevantProcedures.slice(0, 3).map(proc => ({
          procedure_id: proc.id,
          title: proc.title,
          relevance: 'Procedimento consultado'
        }));
      }

      await base44.entities.Message.create({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantResponse,
        sources: sources
      });

      await base44.entities.Conversation.update(conversationId, {
        last_message_at: new Date().toISOString()
      });

      queryClient.invalidateQueries(['messages', conversationId]);
      queryClient.invalidateQueries(['conversations']);

    } catch (error) {
      console.error("Erro ao processar pergunta:", error);
    }

    setIsAsking(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="hidden md:block w-80 border-r border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="p-4 border-b border-slate-200">
          <Button 
            onClick={() => setCurrentConversationId(null)}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <ConversationList 
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelect={setCurrentConversationId}
          />
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Chat com o Oráculo</h1>
              <p className="text-sm text-slate-500">Pergunte sobre procedimentos da empresa</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <EmptyChat />
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
            )}
            {isAsking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <Card className="flex-1 p-4 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pensando...
                  </div>
                </Card>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-slate-200 bg-white/80 backdrop-blur-xl p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Faça uma pergunta sobre procedimentos..."
                disabled={isAsking}
                className="flex-1 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={askQuestion}
                disabled={!question.trim() || isAsking}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
              >
                {isAsking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}