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
  const [shouldStop, setShouldStop] = useState(false);
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
    setShouldStop(false);

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
        if (index < fullResponse.length && !shouldStop) {
          typedText += fullResponse[index];
          setCurrentAIResponse(typedText);
          index++;
          setTimeout(typeEffect, 30);
        } else {
          setChatHistory([...newChat, { role: "ai", text: shouldStop ? typedText : fullResponse }]);
          setCurrentAIResponse("");
          setShouldStop(false);
        }
      };

      typeEffect();
    } catch (error) {
      setChatHistory([...newChat, { role: "ai", text: "Error fetching AI response." }]);
    } finally {
      setLoading(false);
    }
  };

  const stopGeneration = () => {
    setShouldStop(true);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#141e30] to-[#243b55] p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Stylish Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur opacity-30"></div>
          <h1 className="relative text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 drop-shadow-lg mb-2">
            BuddhiAI
          </h1>
        </div>
        <p className="text-white/80 text-sm font-light tracking-wider">Your Intelligent Companion</p>
      </div>

      {/* Hamburger Menu Button - Only show when history is closed */}
      {!showHistory && (
        <button
          onClick={() => setShowHistory(true)}
          className="fixed top-5 right-5 text-white bg-gray-800/80 px-4 py-2 rounded-full hover:bg-gray-700 transition z-50 flex items-center gap-2 backdrop-blur-sm border border-white/10 hover:border-white/20"
        >
          <Menu size={24} />
          <span className="font-medium">History</span>
        </button>
      )}

      <div className="flex gap-6 w-full max-w-5xl mt-24">
        {/* Chat Box */}
        <div className="flex-1 bg-white/10 backdrop-blur-lg shadow-2xl rounded-xl p-6 border border-white/20 relative overflow-hidden">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-br-full"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-tl-full"></div>

          <h1 className="text-2xl font-bold text-center mb-6 text-white drop-shadow-lg relative">
            ✨ Chat with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">BuddhiAI</span>
          </h1>

          {/* Chat Messages */}
          <div
            ref={chatRef}
            className="h-[28rem] overflow-y-auto p-4 space-y-3 bg-white/10 backdrop-blur-md rounded-lg shadow-inner border border-white/20 transition-all relative"
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
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white self-end ml-auto hover:shadow-blue-500/25"
                    : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:shadow-gray-500/25"
                } hover:scale-[1.02]`}
              >
                {msg.text}
              </div>
            ))}
            {/* Typing Effect for AI Response */}
            {currentAIResponse && (
              <div className="p-3 rounded-lg w-fit max-w-[85%] bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-lg hover:shadow-gray-500/25 hover:scale-[1.02] transition-all relative group">
                {currentAIResponse}
                <span className="animate-pulse">|</span>
                <button
                  onClick={stopGeneration}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  title="Stop generation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                </button>
              </div>
            )}
            {loading && !currentAIResponse && (
              <p className="animate-pulse text-gray-200">AI is thinking...</p>
            )}
          </div>

          {/* Input & Button */}
          <div className="mt-4 flex gap-3 items-center">
            <textarea
              className="w-full p-3 border border-white/30 rounded-lg resize-none bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 hover:bg-white/30 backdrop-blur-sm"
              rows="2"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={askAI}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:shadow-green-500/25"
              disabled={loading}
            >
              {loading ? "🤖 ..." : "Ask"}
            </button>
          </div>
        </div>

        {/* Search History Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white/10 backdrop-blur-lg shadow-2xl p-6 border-l border-white/20 transition-transform duration-300 ease-in-out ${
            showHistory ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowHistory(false)}
              className="text-white hover:text-white/80 transition p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          <div
            className="space-y-3 overflow-y-auto h-[calc(100vh-8rem)] pr-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#888 #333",
            }}
          >
            {chatHistory
              .filter((msg) => msg.role === "user")
              .map((msg, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/30 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-white/10"
                >
                  <p className="text-white text-sm group-hover:text-white/90">{msg.text}</p>
                  <div className="mt-2 flex justify-end">
                    <span className="text-xs text-white/60">Click to reuse</span>
                  </div>
                </div>
              ))}
            {chatHistory.filter((msg) => msg.role === "user").length === 0 && (
              <p className="text-white/60 text-center py-4">No search history yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Clear Chat Button */}
      <button
        onClick={clearChat}
        className="absolute bottom-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-full shadow-lg transition-all hover:shadow-red-500/25 hover:scale-105"
      >
        Clear Chat
      </button>
    </div>
  );
}
