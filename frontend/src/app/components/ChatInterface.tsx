// components/ChatInterface.tsx
'use client';

import { useState } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, {role: 'user', content: input}];
    setMessages(newMessages);
    setInput('');
    
    // Send to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages }),
    });
    
    const data = await response.json();
    setMessages([...newMessages, {role: 'assistant', content: data.response}]);
  };
  
  return (
    <div className="border rounded-lg p-4 h-[500px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-100 text-blue-900' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask about the codebase..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}