import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/robot.png";
import user from "../assets/user.png";
import "../assets/loading.css";

const botReplies = [
  {
    keywords: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
    ],
    reply: "Hello! How can I help you with your car rental today?",
  },
  {
    keywords: ["book", "rent", "reserve", "reservation"],
    reply: "Great! What city would you like to rent a car in?",
    state: "awaiting_city",
  },
  {
    keywords: ["price", "cost", "rate", "charges", "fee", "how much"],
    reply:
      "Prices vary by car model and rental duration. What car are you interested in?",
    state: "awaiting_car",
  },
  {
    keywords: ["location", "city", "branch", "where"],
    reply: "We offer rentals in multiple cities. Which location do you need?",
    state: "awaiting_city",
  },
  {
    keywords: [
      "available",
      "availability",
      "in stock",
      "can i get",
      "do you have",
    ],
    reply: "Which car model are you looking for? I can check its availability.",
    state: "awaiting_car",
  },
  {
    keywords: ["duration", "days", "hours", "how long", "period"],
    reply:
      "You can rent a car for as little as 1 hour or up to several weeks. How long do you need the car?",
  },
  {
    keywords: ["insurance", "covered", "damage", "accident"],
    reply:
      "All rentals include basic insurance. Would you like to know about additional coverage options?",
  },
  {
    keywords: ["documents", "id", "license", "requirements", "what do i need"],
    reply:
      "You need a valid driving license and a government-issued ID to rent a car. Anything else you'd like to know?",
  },
  {
    keywords: ["payment", "pay", "card", "upi", "cash", "method"],
    reply:
      "We accept credit/debit cards, UPI, and net banking. Payment is required at the time of booking.",
  },
  {
    keywords: ["cancel", "cancellation", "refund", "change booking"],
    reply:
      "You can cancel or modify your booking up to 24 hours before pick-up for a full refund.",
  },
  {
    keywords: ["pickup", "pick up", "drop", "drop off", "return"],
    reply:
      "You can pick up and drop off the car at any of our locations. Would you like to see the nearest branch?",
  },
  {
    keywords: ["support", "help", "contact", "customer care", "service"],
    reply:
      "You can reach our support team 24/7 via chat, email, or phone. Would you like our contact details?",
  },
  {
    keywords: ["host", "list car", "become host", "earn", "share car"],
    reply:
      "You can list your car with us and start earning. Would you like to know how to become a host?",
  },
  {
    keywords: ["bye", "thank", "thanks", "goodbye", "see you"],
    reply: "Thank you for visiting AutoConnect! Have a great day!",
  },
];

function getBotReply(message, state, setBotState) {
  const msg = message.toLowerCase();

  if (state === "awaiting_city") {
    setBotState(null);
    return `Awesome! Searching for cars available in ${message}. What dates do you need the car for?`;
  }
  if (state === "awaiting_car") {
    setBotState(null);
    return `The price for ${message} depends on the rental duration. For how many days do you want to rent?`;
  }

  // Default keyword matching
  for (const item of botReplies) {
    if (item.keywords.some((k) => msg.includes(k))) {
      setBotState(item.state || null);
      return item.reply;
    }
  }
  return "I'm here to help! Please ask me anything about car rentals.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! 👋 Need help with car rental? Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [botState, setBotState] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: getBotReply(input, botState, setBotState) },
      ]);
    }, 600);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="max-w-[400px] min-h-[500px] bg-white rounded-xl shadow-2xl flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50 rounded-xl">
              <div className="three-body flex gap-2">
                <div className="three-body__dot"></div>
                <div className="three-body__dot"></div>
                <div className="three-body__dot"></div>
              </div>
            </div>
          )}
          <div className="bg-[#2f2240] text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
            <span className="font-semibold">AutoConnect Chatbot</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white text-lg font-bold"
            >
              &times;
            </button>
          </div>
          <div
            className="flex-1 px-4 py-2 overflow-y-auto chatbot"
            style={{ maxHeight: "380px" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`my-2 flex ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.from === "bot" && (
                  <img
                    src={logo}
                    alt="Bot"
                    className="w-9 h-9 rounded-full mr-2 self-center"
                  />
                )}

                <span
                  className={`max-w-[75%] px-3 py-2 rounded-lg text-sm break-words ${
                    msg.from === "user"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {msg.text}
                </span>

                {msg.from === "user" && (
                  <img
                    src={user}
                    alt="user"
                    className="w-8 h-8 rounded-full ml-2 self-end align-self-center"
                  />
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={sendMessage}
            className="flex px-2 py-4 border-t mt-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2f2240] text-sm"
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-[#2f2240] text-white rounded-lg font-semibold hover:bg-[#3d3356] transition"
              disabled={loading}
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#2f2240] text-white px-6 py-3 rounded-full shadow-xl font-semibold hover:bg-[#3d3356] transition flex items-center gap-2"
        >
          <span>Chat</span>
          <span role="img" aria-label="chat">
            💬
          </span>
        </button>
      )}
    </div>
  );
}
