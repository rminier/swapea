"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

export function TradeChat({ tradeId }: { tradeId: string }) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ["messages", tradeId],
    queryFn: async () => {
      const res = await fetch(`/api/trades/${tradeId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
  });

  const [prevInitial, setPrevInitial] = useState<Message[] | undefined>(undefined);

  if (initialMessages && prevInitial !== initialMessages) {
    setPrevInitial(initialMessages);
    setMessages(initialMessages);
  }

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Try to subscribe to pusher, but don't break if credentials are missing
    const client = getPusherClient();
    if (!client) return;

    try {
      const channel = client.subscribe(`trade-${tradeId}`);
      channel.bind("new-message", (newMessage: Message) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });

      return () => {
        client.unsubscribe(`trade-${tradeId}`);
      };
    } catch (e) {
      console.log("Pusher subscription failed", e);
    }
  }, [tradeId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const tempContent = content;
    setContent("");

    try {
      const res = await fetch(`/api/trades/${tradeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempContent }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      
      const newMessage = await res.json();
      // Only add to state if pusher didn't already add it
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    } catch (error) {
      console.error(error);
      setContent(tempContent); // restore content
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-muted/50 p-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Trade Chat</h3>
        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border">Secure & Encrypted</span>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center p-4"><div className="animate-spin w-6 h-6 rounded-full border-b-2 border-primary"></div></div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
            <p>No messages yet.</p>
            <p className="text-sm">Say hi to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender.id === session?.user?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={msg.sender.image || ""} />
                      <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className={`px-4 py-2 rounded-2xl ${
                      isMe 
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm" 
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 mx-10">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-3 bg-background border-t border-border/50 flex gap-2">
        <Input 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          placeholder="Type your message..." 
          className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:ring-purple-500"
        />
        <Button type="submit" disabled={!content.trim()} size="icon" className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
