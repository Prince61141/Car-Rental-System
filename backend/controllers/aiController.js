import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const SYS_PROMPT = `
You are AutoConnect AI Assistant for a car rental system.
Follow business rules:
- Pickup must be >= 3 hours from now (same-day).
- Minimum duration 4 hours.
- Only show cars available and not overlapping existing bookings.
- Cancel allowed until 3 hours before pickup.
- Late return: 15-min grace, then round-up hourly fee (pricePerDay/24).
Collect step-by-step: pickup city, dropoff city, pickup date/time, dropoff date/time.
Offer filters (type, transmission, fuel), show top results with price/day, then offer to quote and book.
Use tools to act. Keep replies short and clear.
`;

const tools = [
  {
    type: "function",
    function: {
      name: "get_all_cities",
      description: "List all cities for autocomplete",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "search_cars",
      description: "Search cars by location and time",
      parameters: {
        type: "object",
        properties: {
          pickup: { type: "string" },
          dropoff: { type: "string" },
          pickupDate: { type: "string" },
          pickupTime: { type: "string" },
          dropoffDate: { type: "string" },
          dropoffTime: { type: "string" },
          type: { type: "string", nullable: true },
          transmission: { type: "string", nullable: true },
          fuel: { type: "string", nullable: true },
        },
        required: ["pickup", "dropoff", "pickupDate", "pickupTime", "dropoffDate", "dropoffTime"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "quote_booking",
      description: "Get a price quote for a car and time range",
      parameters: {
        type: "object",
        properties: {
          carId: { type: "string" },
          pickupDate: { type: "string" },
          pickupTime: { type: "string" },
          dropoffDate: { type: "string" },
          dropoffTime: { type: "string" },
        },
        required: ["carId", "pickupDate", "pickupTime", "dropoffDate", "dropoffTime"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description: "Create a booking for the authenticated renter",
      parameters: {
        type: "object",
        properties: {
          carId: { type: "string" },
          pickupDate: { type: "string" },
          pickupTime: { type: "string" },
          dropoffDate: { type: "string" },
          dropoffTime: { type: "string" },
        },
        required: ["carId", "pickupDate", "pickupTime", "dropoffDate", "dropoffTime"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_bookings",
      description: "List my bookings (renter) or as owner",
      parameters: {
        type: "object",
        properties: { scope: { type: "string", enum: ["me", "owner"], default: "me" } },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_booking",
      description: "Cancel a booking if within the allowed window",
      parameters: {
        type: "object",
        properties: { bookingId: { type: "string" } },
        required: ["bookingId"],
        additionalProperties: false,
      },
    },
  },
];

async function callTool(req, name, args) {
  const base = process.env.APP_BASE_URL;
  const headers = {
    "Content-Type": "application/json",
    Authorization: req.headers.authorization || "",
  };
  switch (name) {
    case "get_all_cities": {
      const r = await fetch(`${base}/api/bookings/cities`, { headers });
      return await r.json();
    }
    case "search_cars": {
      const q = new URLSearchParams(args);
      const r = await fetch(`${base}/api/cars/search?` + q.toString(), { headers });
      const result = await r.json();
      if (Array.isArray(result.cars) && result.cars.length === 0) {
        return { success: false, message: "No cars available in that city for your criteria." };
      }
      return result;
    }
    case "quote_booking": {
      const r = await fetch(`${base}/api/bookings/quote`, {
        method: "POST",
        headers,
        body: JSON.stringify(args),
      });
      return await r.json();
    }
    case "create_booking": {
      const r = await fetch(`${base}/api/bookings`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          carId: args.carId,
          pickupDate: args.pickupDate,
          pickupTime: args.pickupTime,
          dropoffDate: args.dropoffDate,
          dropoffTime: args.dropoffTime,
        }),
      });
      return await r.json();
    }
    case "list_bookings": {
      const scope = args?.scope || "me";
      const r = await fetch(`${base}/api/bookings?scope=${scope}`, { headers });
      return await r.json();
    }
    case "cancel_booking": {
      const r = await fetch(`${base}/api/bookings/${args.bookingId}/cancel`, {
        method: "POST",
        headers,
      });
      return await r.json();
    }
    default:
      return { success: false, message: `Unknown tool: ${name}` };
  }
}

export async function aiChat(req, res) {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "messages[] required" });
    }

    if (!openai) {
      return res.json({
        success: true,
        reply:
          "AI is not configured. Please set OPENAI_API_KEY. Meanwhile, tell me pickup/dropoff city and times, and I’ll search cars.",
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYS_PROMPT }, ...messages],
      tools,
      tool_choice: "auto",
      temperature: 0.3,
    });

    const msg = response.choices[0].message;
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      const toolResults = [];
      let earlyExit = null;
      for (const toolCall of msg.tool_calls) {
        const { name, arguments: argsStr } = toolCall.function;
        const args = argsStr ? JSON.parse(argsStr) : {};
        const result = await callTool(req, name, args);
        // If search_cars returned no cars, reply immediately
        if (name === "search_cars" && result.success === false && result.message) {
          earlyExit = result.message;
          break;
        }
        toolResults.push({
          tool_call_id: toolCall.id,
          name,
          result,
        });
      }
      if (earlyExit) {
        return res.json({ success: true, reply: earlyExit });
      }

      const followup = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYS_PROMPT },
          ...messages,
          msg,
          ...toolResults.map((tr) => ({
            role: "tool",
            tool_call_id: tr.tool_call_id,
            name: tr.name,
            content: JSON.stringify(tr.result),
          })),
        ],
        temperature: 0.3,
      });
      return res.json({
        success: true,
        reply: followup.choices[0].message.content,
      });
    }

    return res.json({ success: true, reply: msg.content });
  } catch (e) {
    console.error("aiChat error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}