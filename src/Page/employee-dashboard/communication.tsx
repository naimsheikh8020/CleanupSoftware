import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/Components/ui/table";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
  useGetChatHistoryQuery,
  useLazyGetChatMessagesQuery,
} from "@/redux/features/employee/chat/getchathistory.api";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  timestamp: Date;
}

const ServiceTable = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: ChatHistory } = useGetChatHistoryQuery();
  const [fetch_chat_messages] = useLazyGetChatMessagesQuery();

  const ws = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [selectedService, setSelectedService] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getServiceName = (u: any) => {
    if (u.subscription) return u.subscription.name;
    if (u.special_service) return u.special_service.name;
    return "No Service";
  };

  const openChat = async (u: any) => {
    ws.current?.close();

    ws.current = new WebSocket(
      `wss://api.checkall.org/ws/chat/one-to-one/${u.email}/?token=${localStorage
        .getItem("access")
        ?.replace(/"/g, "")}`
    );

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.message || data.sender_email === user?.email) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data.message,
          sender: data.sender_email,
          timestamp: new Date(),
        },
      ]);
    };

    setSelectedService(u);
    setMessages([]);

    const res = await fetch_chat_messages(u.email);
    if (res.data?.messages?.length) {
      const mapped = res.data.messages.map((m: any) => ({
        id: m.id,
        sender: m.sender,
        timestamp: new Date(m.timestamp),
        text: m.content,
      }));

      setMessages(mapped);
    }
  };

  const closeChat = () => {
    ws.current?.close();
    setSelectedService(null);
    setMessages([]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now(),
      sender: user?.email ?? "",
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, msg]);

    ws.current?.send(
      JSON.stringify({
        action: "send_message",
        message: newMessage,
      })
    );

    setNewMessage("");
  };

  return (
    <div className="w-full px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Communication</h1>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Chat</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {ChatHistory?.users
              ?.filter((u: any) => u.subscription || u.special_service)
              .map((u: any) => (
                <TableRow key={u.email}>
                  <TableCell>{u.subscription?.name || u.special_service?.name}</TableCell>
                  <TableCell>{u.subscription?.region || u.special_service?.region || "-"}</TableCell>
                  <TableCell>{u.subscription?.building || u.special_service?.building || "-"}</TableCell>
                  <TableCell>{u.email}</TableCell>

                  <TableCell>
                    <Button variant="outline" size="sm" className="flex items-center gap-2"
                      onClick={() => openChat(u)}>
                      <MessageCircle size={16} /> Chat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      {/* Chat Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-blue-600 text-white">
              <div>
                <h2 className="font-semibold text-lg">{getServiceName(selectedService)}</h2>
                <p className="text-xs opacity-80">Client: {selectedService.email}</p>
              </div>
              <button
                onClick={closeChat}
                className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3 scroll-smooth"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === user?.email ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-[75%] text-sm shadow-sm ${
                      msg.sender === user?.email
                        ? "bg-blue-600 text-white"
                        : "bg-white border text-gray-800"
                    }`}
                  >
                    {msg.text}
                    <div className="text-[10px] opacity-50 mt-0.5">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white flex gap-2">
              <input
                className="flex-1 border px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTable;
