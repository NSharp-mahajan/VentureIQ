/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, BrainCircuit, Sparkles, Send, Loader2, RefreshCw, 
  Trash2, Copy, Check, MessageSquare, AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { getVerdictBadgeClass, getVerdictLabel } from "@/lib/verdicts";
import { IReport } from "@/types/report";

const SUGGESTED_QUESTIONS = [
  "Explain this report.",
  "Summarize everything in one minute.",
  "What are the biggest risks?",
  "Would you invest?",
  "Why is the score only 82?", // It's just a placeholder number, real score is in the report
  "What questions should I ask the founders?",
  "Compare strengths and weaknesses.",
  "Explain every score.",
  "What should investors verify next?",
  "What information is still missing?"
];

type Message = { id: string; role: "user" | "assistant"; content: string; createdAt?: Date };

export default function CopilotPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [report, setReport] = useState<IReport | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);

  // Load report and initial chat history
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [reportRes, historyRes] = await Promise.all([
          fetch(`/api/reports/${id}`),
          fetch(`/api/reports/${id}/copilot/history`)
        ]);

        const reportData = await reportRes.json();
        const historyData = await historyRes.json();

        if (reportData.success) {
          setReport(reportData.report);
        } else {
          toast.error("Failed to load report");
        }

        if (historyData.messages) {
          setMessages(historyData.messages);
        }
        if (historyData.title) {
          setConversationTitle(historyData.title);
        }
      } catch (error) {
        toast.error("Failed to initialize Copilot");
      } finally {
        setReportLoading(false);
      }
    }
    loadInitialData();
  }, [id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearConversation = async () => {
    if (!confirm("Are you sure you want to clear this conversation?")) return;
    
    try {
      const res = await fetch(`/api/reports/${id}/copilot/history`, { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
        toast.success("Conversation cleared");
      } else {
        toast.error("Failed to clear conversation");
      }
    } catch (error) {
      toast.error("Failed to clear conversation");
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  };

  const appendMessage = async (newMessages: Message[]) => {
    setMessages(newMessages);
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/reports/${id}/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      let assistantMessageContent = "";
      const assistantId = Math.random().toString();
      
      // Add empty assistant message to be filled
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", createdAt: new Date() }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") {
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                assistantMessageContent += data.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    last.content = assistantMessageContent;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse error on incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      toast.error("Failed to generate response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: input,
      createdAt: new Date()
    };
    
    setInput("");
    appendMessage([...messages, userMessage]);
  };

  const reload = () => {
    if (isLoading || messages.length === 0) return;
    const newMessages = [...messages];
    // Remove the last assistant message if it exists
    if (newMessages[newMessages.length - 1].role === "assistant") {
      newMessages.pop();
    }
    appendMessage(newMessages);
  };

  const handleSuggestedClick = (question: string) => {
    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: question,
      createdAt: new Date()
    };
    appendMessage([...messages, userMessage]);
  };

  if (reportLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Initializing AI Copilot...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <h2 className="text-xl font-bold">Report Not Found</h2>
        <Button onClick={() => router.push('/reports')}>Back to Reports</Button>
      </div>
    );
  }

  const reportScore = report.reportData?.investmentScore || report.aiScore || 0;
  const verdictLabel = report.reportData?.investmentVerdict?.label || report.verdict || "UNKNOWN";
  
  // Format the score suggestion
  const dynamicSuggestions = [...SUGGESTED_QUESTIONS];
  const scoreIndex = dynamicSuggestions.findIndex(s => s.includes("Why is the score only 82?"));
  if (scoreIndex !== -1) {
    dynamicSuggestions[scoreIndex] = `Why is the score ${reportScore}?`;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mt-2">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border/50 gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href={`/reports/${id}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-heading">{conversationTitle || `${report.companyName} Copilot`}</h1>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-2 py-0.5">
                <BrainCircuit className="w-3 h-3 mr-1 inline" /> AI Analyst
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {conversationTitle && <span className="font-medium text-foreground">{report.companyName}</span>}
              {conversationTitle && <span className="w-1 h-1 rounded-full bg-border" />}
              <span className="font-medium text-foreground">Score: {reportScore}/100</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <Badge className={`${getVerdictBadgeClass(verdictLabel)} text-[10px] px-1.5 py-0`}>
                {getVerdictLabel(verdictLabel)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearConversation} className="flex-1 sm:flex-none">
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </Button>
          )}
          <Link href={`/reports/${id}`} className="flex-1 sm:flex-none">
            <Button variant="default" size="sm" className="w-full">
              Back to Report
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 relative bg-background/50 rounded-b-xl border border-t-0 border-border/50">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 py-10">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center">
                <BrainCircuit className="w-10 h-10 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading mb-2">How can I help you analyze {report.companyName}?</h2>
                <p className="text-muted-foreground">
                  I am an expert VC analyst with full context of this report. You can ask me to explain scores, summarize risks, or brainstorm investment hypotheses.
                </p>
              </div>
              
              <div className="w-full">
                <p className="text-sm font-medium text-muted-foreground mb-4 text-left">Suggested Questions</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {dynamicSuggestions.map((suggestion, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary/80 transition-colors font-normal"
                      onClick={() => handleSuggestedClick(suggestion)}
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500 mr-1.5 inline" /> {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                  }`}>
                    {message.role === "user" ? <MessageSquare className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                  </div>
                  
                  <div className={`flex flex-col gap-1 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-card border border-border/50 shadow-sm rounded-tl-sm text-foreground"
                    }`}>
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border/50">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 px-1">
                      {message.createdAt && (
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                      
                      {message.role === "assistant" && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 hover:bg-secondary/50 text-muted-foreground"
                            onClick={() => copyToClipboard(message.content, message.id)}
                            title="Copy response"
                          >
                            {copiedId === message.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                          {/* Only show regenerate on the last message */}
                          {message.id === messages[messages.length - 1]?.id && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 hover:bg-secondary/50 text-muted-foreground"
                              onClick={() => reload()}
                              disabled={isLoading}
                              title="Regenerate response"
                            >
                              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-4 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-4 rounded-2xl rounded-tl-sm bg-card border border-border/50 shadow-sm flex items-center gap-1.5 h-[44px]">
                    <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50 rounded-b-xl shrink-0">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "AI is thinking..." : "Ask a question about this report..."}
              className="pr-12 py-6 text-base rounded-full bg-secondary/30 border-border/50 focus-visible:ring-indigo-500 shadow-inner"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white w-9 h-9"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
              Copilot uses AI and may generate inaccurate information. Always verify critical facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
