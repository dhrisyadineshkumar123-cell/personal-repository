import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useLocation } from 'react-router-dom';

interface Message {
  text: string;
  isBot: boolean;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm your SmartStock AI Assistant. Ask me about inventory, low stock items, or restocking.", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getAuthHeader } = useAuth();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": getAuthHeader()
        },
        body: JSON.stringify({ 
          message: userText,
          page: location.pathname
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Sorry, I am having trouble connecting to the server.", isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-white shadow-neon-purple hover:scale-105 active:scale-95 transition-all z-50 flex items-center justify-center group"
        >
          <Sparkles className="absolute h-4 w-4 -top-1 -right-1 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] bg-card border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b border-white/10 flex items-center relative shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-3 pr-10">
              <div className="bg-primary/20 p-2 rounded-xl text-primary border border-primary/30 shadow-neon-purple shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="truncate">
                <h3 className="text-sm font-display font-bold text-white tracking-wide truncate">SmartStock AI</h3>
                <p className="text-[10px] text-success font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_5px_#10b981]" /> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors z-50 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 h-[350px] overflow-y-auto bg-black/40 custom-scrollbar flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.isBot ? "self-start" : "self-end flex-row-reverse"}`}>
                <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center border shadow-inner ${msg.isBot ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/10 border-white/20 text-white"}`}>
                  {msg.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${msg.isBot ? "bg-white/5 border border-white/5 text-white rounded-tl-sm" : "bg-primary text-white shadow-neon-purple rounded-tr-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center border bg-primary/10 border-primary/30 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 h-[44px]">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-white/10">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="w-full pl-4 pr-12 py-3 bg-black/30 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-white outline-none shadow-inner placeholder:text-muted-foreground/50 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-2 text-center">
              <span className="text-[9px] text-muted-foreground/40 font-mono uppercase tracking-widest">Powered by Nexus AI</span>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
};

export default AIChatbot;
