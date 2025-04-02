"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Menu, X } from "lucide-react"; // Icons for Sidebar

export default function Home() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Stores chat messages
  const [loading, setLoading] = useState(false);
  const [currentAIResponse, setCurrentAIResponse] = useState(""); // Stores text being typed out
  const [showHistory, setShowHistory] = useState(false); // Toggle sidebar visibility
  const chatRef = useRef(null); // Reference for chat container

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory, currentAIResponse]);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setCurrentAIResponse("");

    // Add user message to chat history
    const newChat = [...chatHistory, { role: "user", text: question }];
    setChatHistory(newChat);
    setQuestion("");

    try {
      const res = await axios.post("/api/gemini", { question });

      // Simulate typing effect
      const fullResponse = res.data.reply || "Sorry, I couldn't fetch a response.";
      let typedText = "";
      let index = 0;

      const typeEffect = () => {
        if (index < fullResponse.length) {
          typedText += fullResponse[index];
          setCurrentAIResponse(typedText);
          index++;
          setTimeout(typeEffect, 30);
        } else {
          setChatHistory([...newChat, { role: "ai", text: fullResponse }]);
          setCurrentAIResponse("");
        }
      };

      typeEffect();
    } catch (error) {
      setChatHistory([...newChat, { role: "ai", text: "Error fetching AI response." }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press (submit on Enter, allow newline on Shift+Enter)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  // Function to clear the chat and start a new conversation
  const clearChat = () => {
    setChatHistory([]); // Clear chat history
    setQuestion(""); // Clear input field
    setCurrentAIResponse(""); // Clear AI response state
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#141e30] to-[#243b55] p-6 relative">
      {/* History Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 p-5 transition-transform ${
          showHistory ? "translate-x-0" : "-translate-x-full"
        } shadow-xl z-50`}
      >
        <button onClick={() => setShowHistory(false)} className="absolute top-3 right-3">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">📜 Search History</h2>
        <ul className="space-y-2 overflow-y-auto h-[80vh]">
          {chatHistory
            .filter((msg) => msg.role === "user")
            .map((msg, index) => (
              <li
                key={index}
                className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition"
              >
                {msg.text}
              </li>
            ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-6 border border-white/20">
        {/* Nav Icon for History */}
        <button
          onClick={() => setShowHistory(true)}
          className="absolute top-5 left-5 text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
          ✨ Chat with <span className="text-green-400">Gemini AI</span>
        </h1>

        {/* Chat Messages */}
        <div
          ref={chatRef}
          className="h-96 overflow-y-auto p-4 space-y-3 bg-white/10 backdrop-blur-md rounded-lg shadow-inner border border-white/20 transition-all"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #333",
          }}
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg w-fit max-w-[85%] shadow-lg transition-all ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white self-end ml-auto"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {/* Typing Effect for AI Response */}
          {currentAIResponse && (
            <div className="p-3 rounded-lg w-fit max-w-[85%] bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-lg">
              {currentAIResponse}
              <span className="animate-pulse">|</span> {/* Blinking cursor effect */}
            </div>
          )}
          {loading && !currentAIResponse && (
            <p className="animate-pulse text-gray-200">AI is thinking...</p>
          )}
        </div>

        {/* Input & Button */}
        <div className="mt-4 flex gap-3 items-center">
          <textarea
            className="w-full p-3 border border-white/30 rounded-lg resize-none bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:bg-white/30"
            rows="2"
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown} // Enter key support
          />
          <button
            onClick={askAI}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            disabled={loading}
          >
            {loading ? "🤖 ..." : "Ask"}
          </button>
        </div>
      </div>

      {/* Clear Chat Button (Positioned in the bottom left corner) */}
      <button
        onClick={clearChat}
        className="absolute bottom-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg transition-all"
      >
        Clear Chat
      </button>
    </div>
  );
}
