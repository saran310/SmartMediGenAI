"use client";
import { useState, useEffect, useRef } from "react";

type Place = { name: string; lat: number; lon: number; distance: number };

type Message = {
  role: string;
  text?: string;
  places?: Place[];
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [ocrText, setOcrText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // ✅ Reset state when chatbot opens
  useEffect(() => {
    if (open) {
      setMessages([
        {
          role: "bot",
          text: "👋 Hi! I’m your AI Medical Assistant. You can ask questions, upload prescriptions, type 'summarize', or click 'Nearby Services' anytime.",
        },
      ]);
      setOcrText("");
      setInput("");
    }
  }, [open]);

  // ✅ Smart auto-scroll
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, clientHeight, scrollHeight } =
        chatContainerRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 20;
      setAutoScroll(atBottom);
    }
  };

  async function sendMessage() {
    if (!input) return;

    const userMessage = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");

    // ✅ If user types 'summarize' → trigger summary
    if (userMessage.toLowerCase() === "summarize") {
      const combined = messages
        .filter((m) => m.role === "user")
        .map((m) => m.text)
        .join(". ");

      const res = await fetch("http://localhost:8000/chat-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: combined }),
      });
      const data = await res.json();

      setMessages((m) => [
        ...m,
        { role: "bot", text: "📋 Summary: " + data.summary },
      ]);
      sessionStorage.setItem("diagnosisSummary", data.summary);
      return;
    }

    // ✅ Normal chat flow
    const res = await fetch("http://localhost:8000/chat-predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });
    const data = await res.json();
    setMessages((m) => [...m, { role: "bot", text: data.reply }]);
  }

  async function extractOCR(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://localhost:8000/ocr-text", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    setMessages((m) => [
      ...m,
      { role: "user", text: "📤 Uploaded Prescription" },
      { role: "bot", text: "📝 Extracted: " + data.extracted_text },
    ]);

    setOcrText(data.extracted_text);
  }

  // ✅ Distance calculator (Haversine formula)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2)); // rounded to 2 decimals
  }

  // ✅ Nearby services (cards with distance)
  async function fetchNearbyServices() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const query = `[out:json];
          (
            node["amenity"="hospital"](around:2000,${lat},${lon});
            node["amenity"="clinic"](around:2000,${lat},${lon});
            node["amenity"="pharmacy"](around:2000,${lat},${lon});
          );
          out;`;

        try {
          const response = await fetch(
            "https://overpass-api.de/api/interpreter?data=" +
              encodeURIComponent(query)
          );
          const data = await response.json();

          if (data.elements.length > 0) {
            const places: Place[] = data.elements.slice(0, 5).map((p: any) => ({
              name: p.tags.name || "Unnamed place",
              lat: p.lat,
              lon: p.lon,
              distance: calculateDistance(lat, lon, p.lat, p.lon),
            }));

            setMessages((m) => [...m, { role: "bot", places }]);
          } else {
            setMessages((m) => [
              ...m,
              { role: "bot", text: "❌ No nearby clinics/hospitals/pharmacies found." },
            ]);
          }
        } catch (err) {
          setMessages((m) => [
            ...m,
            { role: "bot", text: "⚠️ Error fetching nearby services." },
          ]);
        }
      });
    } else {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "⚠️ Location not available in your browser." },
      ]);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-20 right-6 w-96 h-[500px] bg-white border rounded-2xl shadow-lg flex flex-col">
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-2xl">
            <h3 className="font-bold">AI Medical Assistant</h3>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          {/* Chat messages (scrollable area) */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 p-3 overflow-y-auto space-y-2"
          >
            {messages.map((m, i) => (
              <div key={i}>
                {/* Normal messages */}
                {m.text && (
                  <div
                    className={`max-w-[80%] p-2 rounded-lg whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {m.text}
                  </div>
                )}

                {/* Nearby service cards */}
                {m.places && (
                  <div className="space-y-2">
                    {m.places.map((place, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-2 bg-gray-100 shadow-sm"
                      >
                        <p className="font-semibold">{place.name}</p>
                        <p className="text-sm text-gray-600">
                           {place.distance} km away
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${place.lat},${place.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                           View on Google Maps
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div className="p-3 border-t flex items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              id="prescriptionUpload"
              className="hidden"
              onChange={(e) =>
                e.target.files && extractOCR(e.target.files[0])
              }
            />

            {/* Upload button */}
            <button
              onClick={() =>
                document.getElementById("prescriptionUpload")?.click()
              }
              className="p-2 bg-gray-200 rounded-full"
              title="Upload Prescription"
            >
              📎
            </button>

            {/* Nearby Services button */}
            <button
              onClick={fetchNearbyServices}
              className="p-2 bg-green-500 text-white rounded-full"
              title="Find Nearby Services"
            >
              🏥
            </button>

            {/* Text input (Enter to send) */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 border p-2 rounded"
              placeholder="Ask anything... (type 'summarize' for report)"
            />

            {/* Send button */}
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
