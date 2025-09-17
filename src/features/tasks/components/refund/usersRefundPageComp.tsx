"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserDisputeswithTasks } from "../../server/task-types";

interface DisputesPageProps {
  disputes: UserDisputeswithTasks;
}

export function DisputesPage({ disputes }: DisputesPageProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Disputes</h1>

      {disputes.length === 0 ? (
        <p className="text-muted-foreground">No disputes found.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <Card key={d.tasks.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{d.tasks.title}</CardTitle>
                    <CardDescription>
                      Created{" "}
                      {d.tasks.createdAt
                        ? new Date(d.tasks.createdAt).toLocaleDateString()
                        : "N/A"}
                    </CardDescription>
                  </div>
                  {d.refunds && (
                    <Badge variant="outline" className="uppercase">
                      {d.refunds.refundStatus ?? "UNKNOWN"}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {d.tasks.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {d.tasks.description}
                  </p>
                )}

                {d.refunds?.refundReason && (
                  <div className="text-sm">
                    <span className="font-medium">Refund Reason: </span>
                    {d.refunds.refundReason}
                  </div>
                )}

                {d.tasks.price !== null && (
                  <div className="text-sm">
                    <span className="font-medium">Price: </span>${d.tasks.price}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveChat(d.tasks.id)}>
                  Open Chat
                </Button>
                <Button onClick={() => toast.success(d.tasks.id)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {activeChat && (
        <DisputeChat taskId={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </div>
  );
}

interface ChatMessage {
  id: string;
  sender: "me" | "other";
  text: string;
}

interface DisputeChatProps {
  taskId: string;
  onClose: () => void;
}

function DisputeChat({ taskId, onClose }: DisputeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "me", text: input },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card className="flex flex-col h-96">
        <CardHeader className="flex flex-row items-center justify-between py-2">
          <CardTitle className="text-base">Dispute Chat</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-0">
          <ScrollArea className="flex-1 p-4 max-h-55 ">
            <div className="space-y-2 h-55">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`text-sm px-3 py-2 rounded-lg max-w-[75%] ${
                    m.sender === "me"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted"
                  }`}>
                  {m.text}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-2 flex gap-2 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
