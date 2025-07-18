import React, { useState, useRef, useEffect } from "react";

const botReplies = [
  { keywords: ["hello", "hi"], reply: "Hello! How can I help you with your car rental today?" },
  { keywords: ["book", "rent"], reply: "To book a car, please use the search bar above or tell me your requirements." },
  { keywords: ["price", "cost"], reply: "Prices vary by car model and rental duration. What car are you interested in?" },
  { keywords: ["location"], reply: "We offer rentals in multiple cities. Which location do you need?" },
  { keywords: ["bye", "thank"], reply: "Thank you for visiting AutoConnect! Have a great day!" },
];

function getBotReply(message) {
  const msg = message.toLowerCase();
  for (const item of botReplies) {
    if (item.keywords.some(k => msg.includes(k))) return item.reply;
  }
  return "I'm here to help! Please ask me anything about car rentals.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! 👋 Need help with car rental? Ask me anything." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: getBotReply(input) }
      ]);
    }, 600);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="max-w-[400px] min-h-[500px] min-h-100 bg-white rounded-xl shadow-2xl flex flex-col">
          <div className="bg-[#3d3356] text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
            <span className="font-semibold">AutoConnect Chatbot</span>
            <button onClick={() => setOpen(false)} className="text-white text-lg font-bold">&times;</button>
          </div>
          <div className="flex-1 px-4 py-2 overflow-y-auto" style={{ maxHeight: "380px" }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`my-2 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <span className={`px-3 py-2 rounded-lg text-sm ${msg.from === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-700"}`}>
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex px-2 py-4 border-t mt-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3d3356] text-sm"
              placeholder="Type your message..."
            />
            <button type="submit" className="ml-2 px-4 py-2 bg-[#3d3356] text-white rounded-lg font-semibold hover:bg-[#2a223e] transition">
              Send
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#3d3356] text-white px-6 py-3 rounded-full shadow-xl font-semibold hover:bg-[#2a223e] transition flex items-center gap-2"
        >
          <span>Chat</span>
          <span role="img" aria-label="chat">💬</span>
        </button>
      )}
    </div>
  );
}