'use client'
import React, { useState } from 'react';

// TYPES -------------------------------------------------

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface Persona {
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
}

// --------------------------------------------------------

const PersonaChat = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>('Hitesh Choudhary');
  const [message, setMessage] = useState<string>('');
  const[userMessage,setUserMessage]=useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  const personas: Persona[] = [
    {
      name: 'Hitesh Choudhary',
      title: 'Tech Educator & Entrepreneur',
      description: 'Passionate about teaching programming with a focus on practical knowledge and real-world applications.',
      avatar: '👨‍💻',
      color: 'bg-orange-600'
    },
    {
      name: 'Piyush Garg',
      title: 'Full Stack Developer',
      description: 'Building scalable applications and sharing knowledge through tutorials.',
      avatar: '👨‍💼',
      color: 'bg-blue-600'
    },
    {
      name: 'Mannu Paaji',
      title: 'DevOps Engineer',
      description: 'Expert in cloud infrastructure and automation.',
      avatar: '🧑‍💻',
      color: 'bg-purple-600'
    },
    {
      name: 'Partha Ghosh Sir',
      title: 'Data Scientist',
      description: 'Specializing in machine learning and AI solutions.',
      avatar: '📊',
      color: 'bg-green-600'
    }
  ];

  const selected = personas.find((p) => p.name === selectedPersona);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, newMessage]);
      setUserMessage(newMessage.text);
      setMessage('');

      // Simulate AI response
      setTimeout(async() => {
        console.log('Sending message to AI:', userMessage);
       console.log(userMessage)
        const res= await fetch('http://127.0.0.1:8000/chat',{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({
            "session_id": "abc123",
             "query": `${newMessage.text}`
          })
        });
       const answer=await res.json()

       console.log(answer)

        const aiResponse: Message = {
          id: Date.now() + 1,
          text: `${answer.answer}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 p-4">
        <h2 className="text-xl font-bold mb-6">Select Persona</h2>
        <div className="space-y-2">
         
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-neutral-800 p-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${selected?.color} flex items-center justify-center text-3xl`}>
              {selected?.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{selected?.name}</h1>
              <p className="text-neutral-400">{selected?.title}</p>
            </div>
          </div>
          <p className="mt-4 text-neutral-300">{selected?.description}</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-500">
              Start a conversation with {selected?.name}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xl rounded-lg px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'bg-neutral-800 text-neutral-100'
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

        {/* Input Area */}
        <div className="p-6 border-t border-neutral-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-neutral-800 border border-orange-600 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <button
              onClick={handleSend}
              className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaChat;
