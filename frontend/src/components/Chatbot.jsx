import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

function parseAiCars(text = "") {
  const raw = String(text || "");
  const parts = raw
    .split(/\n?\s*\d+\.\s+/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const cars = [];
  for (const part of parts) {
    const looksLikeCar =
      /\*\*[^*]+\*\*/.test(part) ||
      /Transmission:/i.test(part) ||
      /Fuel\s*Type:/i.test(part);
    if (!looksLikeCar) continue;

    const nameMatch = part.match(/\*\*([^*]+)\*\*/);
    const transmissionMatch = part.match(/Transmission:\**\s*([A-Za-z]+)/i);
    const fuelMatch = part.match(/Fuel\s*Type:\**\s*([A-Za-z]+)/i);
    const seatsMatch = part.match(/Seats:\**\s*(\d+)/i);
    const priceMatch = part.match(/Price\/Day:\**\s*₹?\s*([\d,]+)/i);
    const imgMatch = part.match(/!\[[^\]]*\]\(([^)]+)\)/);

    const pricePerDay = priceMatch
      ? Number(String(priceMatch[1]).replace(/[^\d]/g, "")) || 0
      : 0;

    const car = {
      id: `${nameMatch ? nameMatch[1].trim() : "car"}-${pricePerDay}-${
        cars.length
      }`,
      name: nameMatch ? nameMatch[1].trim() : "",
      transmission: transmissionMatch ? transmissionMatch[1] : "",
      fuelType: fuelMatch ? fuelMatch[1] : "",
      seats: seatsMatch ? Number(seatsMatch[1]) : undefined,
      pricePerDay,
      imageUrl: imgMatch ? imgMatch[1] : "",
    };

    if (car.name || car.imageUrl || car.transmission || car.fuelType) {
      cars.push(car);
    }
  }
  return cars;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! 👋 Need help with car rental? Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [botState, setBotState] = useState(null);
  const [aiEnabled, setAiEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();

  const handleCardClick = (car) => {
    const id = (car?.id || "").trim();
    const q = id ? `/${encodeURIComponent(id)}` : "";
    navigate(`/rent${q}`);
  };

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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");

    if (!aiEnabled) {
      // fallback to keyword bot
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          {
            from: "bot",
            text: getBotReply(userMsg.text, botState, setBotState),
          },
        ]);
      }, 600);
      return;
    }

    try {
      const conv = [
        { role: "system", content: "Keep answers short." },
        ...messages.map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: userMsg.text },
      ];

      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: conv }),
      });
      const data = await res.json();
      const replyText =
        (res.ok && data?.success && data?.reply) ||
        "Sorry, I couldn't process that. Please try again.";

      const cars = parseAiCars(replyText);
      setMessages((msgs) => [...msgs, { from: "bot", text: replyText, cars }]);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { from: "bot", text: "Network error. Please try again." },
      ]);
    }
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
            {messages.map((msg, idx) => {
              const hasCars = Array.isArray(msg.cars) && msg.cars.length > 0;
              return (
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
                    {/* Hide raw text when cars are present */}
                    {!hasCars && msg.text}

                    {/* Small card list for cars */}
                    {hasCars && (
                      <div className="grid grid-cols-1 gap-2">
                        {msg.cars.map((c) => (
                          <div
                            key={c.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleCardClick(c)}
                            onKeyDown={(e) =>
                              e.key === "Enter" ? handleCardClick(c) : null
                            }
                            className="border rounded-lg overflow-hidden bg-white text-gray-800 cursor-pointer hover:shadow-md transition"
                            title="Click to book this car"
                          >
                            <div className="aspect-video bg-gray-100">
                              {c.imageUrl ? (
                                <img
                                  src={c.imageUrl}
                                  alt={c.name || "Car"}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <div className="font-semibold text-sm truncate">
                                {c.name || "Car"}
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-gray-50 border rounded px-2 py-1">
                                  <span className="text-gray-500">
                                    Transmission:
                                  </span>{" "}
                                  {c.transmission || "—"}
                                </div>
                                <div className="bg-gray-50 border rounded px-2 py-1">
                                  <span className="text-gray-500">
                                    Fuel Type:
                                  </span>{" "}
                                  {c.fuelType || "—"}
                                </div>
                                <div className="bg-gray-50 border rounded px-2 py-1">
                                  <span className="text-gray-500">Seats:</span>{" "}
                                  {Number.isFinite(c.seats) ? c.seats : "—"}
                                </div>
                                <div className="bg-gray-50 border rounded px-2 py-1">
                                  <span className="text-gray-500">
                                    Price/Day:
                                  </span>{" "}
                                  ₹{Number(c.pricePerDay || 0).toFixed(0)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </span>

                  {msg.from === "user" && (
                    <img
                      src={user}
                      alt="user"
                      className="w-8 h-8 rounded-full ml-2 self-end align-self-center"
                    />
                  )}
                </div>
              );
            })}

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
