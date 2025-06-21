"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Star,
  Clock,
  CheckCheck,
  BookOpen,
  Award,
  MessageCircle,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender: "user" | "mentor" | "system";
  content: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  type: "text" | "file" | "system";
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "system",
    content: "Mentorship session started with Sarah Chen",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "read",
    type: "system",
  },
  {
    id: "2",
    sender: "mentor",
    content:
      "Hi there! I'm Sarah Chen, your assigned mentor for Computer Science. I see you're working on a contact form debugging task. How's it going so far?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
    status: "read",
    type: "text",
  },
  {
    id: "3",
    sender: "user",
    content:
      "Hello Chen! Thanks for reaching out. I've been struggling with the form validation part. The frontend validation seems to work, but I'm having issues with the backend integration.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000),
    status: "read",
    type: "text",
  },
  {
    id: "4",
    sender: "mentor",
    content:
      "That's a common challenge! Let's break it down step by step. Can you share what specific error messages you're seeing when the form submits?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000),
    status: "read",
    type: "text",
  },
  {
    id: "5",
    sender: "user",
    content:
      "I'm getting a 500 internal server error, but the console doesn't show much detail. I think it might be related to the email configuration in my Flask app.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 20 * 60 * 1000),
    status: "read",
    type: "text",
  },
  {
    id: "6",
    sender: "mentor",
    content:
      "Ah, that's likely the issue! Email configuration can be tricky. Have you set up your SMTP credentials correctly? Also, make sure you're handling exceptions properly in your Flask route. Here's a quick checklist:\n\n1. Verify SMTP server settings\n2. Check environment variables\n3. Add proper error logging\n4. Test with a simple email first",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 25 * 60 * 1000),
    status: "read",
    type: "text",
  },
  {
    id: "7",
    sender: "user",
    content:
      "That makes sense! I think I missed setting up the environment variables properly. Let me check that and get back to you.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: "read",
    type: "text",
  },
  {
    id: "8",
    sender: "mentor",
    content:
      "Perfect! Take your time. I'll be here if you need any help. Also, don't forget to test in a development environment first before deploying. Good luck! 🚀",
    timestamp: new Date(Date.now() - 50 * 60 * 1000),
    status: "read",
    type: "text",
  },
  {
    id: "9",
    sender: "user",
    content:
      "Update: I fixed the environment variables and added better error handling. The form is working now! Thank you so much for the guidance.",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: "delivered",
    type: "text",
  },
];

const mentorInfo = {
  name: "Sarah Chen",
  title: "Senior Software Engineer Student",
  university: "Stanford University",
  rating: 4.9,
  totalSessions: 247,
  responseTime: "< 2 hours",
  expertise: ["Web Development", "Python", "JavaScript"],
  avatar: "/placeholder.svg?height=40&width=40",
};

const upcomingSessions = [
  {
    id: "1",
    title: "Code Review Session",
    date: "Today, 3:00 PM",
    duration: "45 min",
    type: "video",
  }
];

export default function MentorshipWorkspace() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: newMessage,
      timestamp: new Date(),
      status: "sent",
      type: "text",
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate mentor typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const mentorReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "mentor",
        content:
          "Thanks for the update! I'm glad I could help. Feel free to reach out if you have any more questions. Keep up the great work! 👍",
        timestamp: new Date(),
        status: "sent",
        type: "text",
      };
      setMessages((prev) => [...prev, mentorReply]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex h-[600px] w-full rounded-xl shadow-lg border overflow-hidden">
    
      <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-16 h-16 mb-2">
              <AvatarImage src={mentorInfo.avatar} alt={mentorInfo.name} />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <h2 className="text-sm font-medium text-gray-900 dark:text-white">
              {mentorInfo.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mentorInfo.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {mentorInfo.university}
            </p>
            <div className="mt-2">
              <Badge variant="outline">{mentorInfo.rating} ★</Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Expertise
            </h3>
            <div className="flex flex-wrap gap-1">
              {mentorInfo.expertise.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Upcoming Sessions
            </h3>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
              {upcomingSessions.map((session) => (
                <li key={session.id} className="flex flex-col">
                  <span className="font-medium">{session.title}</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {session.date} • {session.duration}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 min-w-0">

        <div className="shrink-0 p-3 border-b border-background/20 bg-sidebar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={mentorInfo.avatar || "/placeholder.svg"}
                  alt={mentorInfo.name}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                  SC
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {mentorInfo.name}
                </h3>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Online • Responds in {mentorInfo.responseTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Search className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Phone className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Video className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

    
        <div className="flex-1 overflow-y-auto px-3 py-2"  ref={chatContainerRef}>
          <div className="space-y-3">
            {messages.map((message, index) => {
              const showDate =
                index === 0 ||
                formatDate(message.timestamp) !==
                  formatDate(messages[index - 1].timestamp);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {message.type === "system" ? (
                    <div className="flex justify-center">
                      <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        {message.content}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}>
                      <div
                        className={`flex gap-2 max-w-[80%] ${
                          message.sender === "user" ? "flex-row-reverse" : ""
                        }`}>
                        {message.sender === "mentor" && (
                          <Avatar className="w-6 h-6 mt-1">
                            <AvatarImage
                              src={mentorInfo.avatar || "/placeholder.svg"}
                              alt={mentorInfo.name}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              SC
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`px-3 py-2 rounded-2xl ${
                            message.sender === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}>
                          <p className="text-xs whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              message.sender === "user" ? "justify-end" : ""
                            }`}>
                            <span
                              className={`text-xs ${
                                message.sender === "user"
                                  ? "text-blue-100"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {message.sender === "user" && (
                              <CheckCheck
                                className={`w-3 h-3 ${
                                  message.status === "read"
                                    ? "text-blue-200"
                                    : "text-blue-300"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <Avatar className="w-6 h-6 mt-1">
                    <AvatarImage
                      src={mentorInfo.avatar || "/placeholder.svg"}
                      alt={mentorInfo.name}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      SC
                    </AvatarFallback>
                  </Avatar>
                  <div className="px-3 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

      
        <div className=" shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled className="h-7 w-7 p-0">
              <Paperclip className="w-3 h-3" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="pr-8 h-8 text-sm"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                disabled>
                <Smile className="w-3 h-3" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="h-8">
              <Send className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            ⚠️ Sandbox Mode - Messages are not actually sent
          </p>
        </div>
      </div>
    </div>
  );
}
