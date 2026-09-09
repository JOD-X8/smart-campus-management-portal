"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAskAiAssistantMutation, useGetAiInsightsQuery } from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  suggestions?: string[];
  timestamp: string;
}

export default function AiAssistantPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [askAi, { isLoading }] = useAskAiAssistantMutation();
  const { data: insightsData } = useGetAiInsightsQuery(undefined);
  const insights = insightsData?.data || [];

  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: `Hello ${
        user?.name || "Student"
      }! I am your AI Academic Advisor. I analyze your real-time attendance, grades, and upcoming assignment deadlines to offer personalized guidance.\n\nHow can I help you today? You can select any of the sample prompts below or type your question.`,
      suggestions: [
        "How is my attendance?",
        "What assignments are due this week?",
        "Which subjects am I performing poorly in?",
        "How can I improve my academic performance?",
        "Summarize my academic progress.",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    try {
      const response = await askAi({ message: query }).unwrap();
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: response.data.reply,
        suggestions: response.data.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: "I encountered a communication issue while retrieving your academic profile. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-amber-500" />
            AI Academic Assistant &amp; Insights
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Privacy-safe contextual advisor grounded strictly in your personal academic records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          <span>Role-Grounded Data Isolation Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2 flex flex-col h-[640px] p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-md">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Campus AI Advisor
                </h4>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Academic Grounding
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center shrink-0 text-xs mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 whitespace-pre-line"
                    }`}
                  >
                    {m.text}
                  </div>

                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(s)}
                          className="text-[11px] rounded-full border border-indigo-200 bg-white px-2.5 py-1 font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950/50 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block px-1">
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === "user" && (
                  <div className="h-7 w-7 rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 text-xs mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-xs text-slate-400 italic">
                <Bot className="h-4 w-4 text-indigo-500 animate-spin" />
                Analyzing academic telemetry and drafting recommendations...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about attendance, grades, weak subjects, or upcoming homework..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:bg-slate-900"
              />
              <Button type="submit" size="sm" disabled={isLoading || !inputMessage.trim()} className="gap-1 px-4">
                <Send className="h-3.5 w-3.5" /> Send
              </Button>
            </form>
          </div>
        </Card>

        {/* Real-Time Performance Insights Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Automated Performance Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No critical academic anomalies or warnings detected for this term.
                </p>
              ) : (
                insights.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:bg-slate-800/40 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {item.type === "danger" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        )}
                        {item.title}
                      </span>
                      <Badge
                        variant={item.type === "danger" ? "danger" : item.type === "warning" ? "warning" : "success"}
                        size="sm"
                      >
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Privacy & Explainability Card */}
          <Card className="bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 p-5">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Privacy &amp; Safety Safeguards
            </h4>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
              <li>All responses are grounded strictly in your personal authorized courses and records.</li>
              <li>Peer student records and private faculty notes are completely isolated.</li>
              <li>No personal information is transmitted to third-party ad networks.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
