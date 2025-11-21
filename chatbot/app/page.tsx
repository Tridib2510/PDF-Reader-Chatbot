"use client";
import React, { useState } from "react";
import PDFUploadModal from "@/components/PDFUploadModel/PDFUploadModel";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface Persona {
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
}

const PersonaChat = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>("Hitesh Choudhary");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const personas: Persona[] = [
    {
      name: "Hitesh Choudhary",
      title: "Tech Educator & Entrepreneur",
      description:
        "Passionate about teaching programming with a focus on practical knowledge and real-world applications.",
      avatar: "👨‍💻",
      color: "bg-orange-600",
    },
    {
      name: "Piyush Garg",
      title: "Full Stack Developer",
      description: "Building scalable applications and sharing knowledge through tutorials.",
      avatar: "👨‍💼",
      color: "bg-blue-600",
    },
    {
      name: "Mannu Paaji",
      title: "DevOps Engineer",
      description: "Expert in cloud infrastructure and automation.",
      avatar: "🧑‍💻",
      color: "bg-purple-600",
    },
    {
      name: "Partha Ghosh Sir",
      title: "Data Scientist",
      description: "Specializing in machine learning and AI solutions.",
      avatar: "📊",
      color: "bg-green-600",
    },
  ];

  const selected = personas.find((p) => p.name === selectedPersona);

  const handlePDFUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);
  };

  const handleSend = async () => {
    if (!message.trim()) return; 

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");

    const res = await fetch(`${BACKEND_URL}/chat?user_id=abc123`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: "abc123", query: newMessage.text }),
    });

    const answer = await res.json();

    const aiResponse: Message = {
      id: Date.now() + 1,
      text: `${answer.answer}`,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white">
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 p-4">
        
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-neutral-800 p-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${selected?.color} flex items-center justify-center text-3xl`}>
              {selected?.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold">PDF ASSISTANT</h1>
              <p className="text-neutral-400">Get Your Answers Based on PDF</p>
            </div>
          </div>
          {/* <p className="mt-4 text-neutral-300">{selected?.description}</p> */}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500">
            Start the conversation by typing a message below.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xl rounded-lg px-4 py-3 ${
                      msg.sender === "user"
                        ? "bg-orange-600 text-white"
                        : "bg-neutral-800 text-neutral-100"
                    }`}
                  >
                    <p className="text-sm mb-1">{msg.text}</p>
                    <span className="text-xs opacity-70">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-800">
          <div className="flex gap-3">
            <button
              onClick={() => setIsPDFModalOpen(true)}
              className="bg-neutral-700 hover:bg-neutral-600 px-4 py-3 rounded-lg font-semibold"
            >
              Upload PDF
            </button>

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-neutral-800 border border-orange-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <button
              onClick={handleSend}
              className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <PDFUploadModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        
      />
    </div>
  );
};

export default PersonaChat;