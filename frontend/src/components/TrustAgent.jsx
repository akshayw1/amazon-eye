import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';

const TrustAgent = ({ productId, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const TRUST_AGENT_API = 'http://13.235.131.131:5000';

  // Load persisted messages on mount
  useEffect(() => {
    if (isExpanded && productId) {
      const savedMessages = localStorage.getItem(`chat_${productId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
  }, [isExpanded, productId]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (productId && messages.length > 0) {
      localStorage.setItem(`chat_${productId}`, JSON.stringify(messages));
    }
  }, [messages, productId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setMessages([]);
      setPendingApproval(null);
      setError(null);
    };
  }, []);

  useEffect(() => {
    if (isExpanded && user?.id && productId) {
      activateSession();
    }
  }, [isExpanded, user?.id, productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const activateSession = async () => {
    if (!user) {
      setError('Please log in to chat with Amazon Eye');
      return;
    }

    setIsActivating(true);
    setError(null);

    try {
      const response = await axios.post(`${TRUST_AGENT_API}/activate`, {
        user_id: user.id,
        product_id: productId
      });
      
      if (response.data.status === 'activated') {
        setMessages(prev => {
          if (prev.length === 0) {
            return [{
              type: 'assistant',
              content: "Hi! I'm Amazon Eye, your trusted shopping assistant. How can I help you today?"
            }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error activating session:', error);
      setError('Failed to connect to Amazon Eye. Please try again later.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${TRUST_AGENT_API}/chat`, {
        user_id: user.id,
        product_id: productId,
        message: userMessage
      });

      if (response.data.type === 'approval_required') {
        setPendingApproval({
          ...response.data,
          tool_call_id: response.data.tool_call_id
        });
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: response.data.message,
          requiresApproval: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: response.data.response
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (approved) => {
    if (!pendingApproval?.tool_call_id) {
      setError('Invalid approval request');
      return;
    }

    try {
      const response = await axios.post(`${TRUST_AGENT_API}/chat`, {
        user_id: user.id,
        product_id: productId,
        approval: {
          approved,
          tool_call_id: pendingApproval.tool_call_id
        }
      });

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: response.data.response
      }]);
    } catch (error) {
      console.error('Error handling approval:', error);
      setError('Failed to process approval. Please try again.');
    } finally {
      setPendingApproval(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 left-4 bg-gradient-to-r from-amazon-blue to-blue-700 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-amazon-blue group animate-pulse"
        aria-label="Open Amazon Eye Chat"
      >
        <div className="relative">
          <img
            src="/eye-icon.svg"
            alt="Amazon Eye"
            className="w-8 h-8 filter brightness-0 invert group-hover:scale-110 transition-transform duration-200"
          />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amazon-yellow rounded-full border-2 border-white animate-ping"></div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amazon-blue to-blue-700 rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHg9IjAiIHk9IjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgb3BhY2l0eT0iMC4wNSIgLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')] opacity-50"></div>
        <div className="flex items-center space-x-3 z-10">
          <div className="bg-white p-2 rounded-full shadow-md">
            <img
              src="/eye-icon.svg"
              alt="Amazon Eye"
              className="w-6 h-6"
            />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Amazon Eye</h3>
            <p className="text-blue-100 text-xs">Your Shopping Assistant</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsExpanded(false);
            onClose?.();
          }}
          className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1 hover:bg-white/10 transition-colors duration-200 z-10"
          aria-label="Close chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-100 animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #f3f4f6 0%, transparent 70%)',
          backgroundSize: '24px 24px'
        }}
      >
        {isActivating ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center space-y-3 bg-white p-6 rounded-xl shadow-lg">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-amazon-blue rounded-full animate-spin border-t-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src="/eye-icon.svg" alt="" className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium">Connecting to Amazon Eye...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 mt-1">
                    <img src="/eye-icon.svg" alt="" className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-amazon-blue to-blue-700 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <div className="text-sm break-words leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Override default components to maintain chat styling
                        p: ({node, ...props}) => <p className={`${message.type === 'user' ? 'text-white' : 'text-gray-800'} mb-0`} {...props} />,
                        a: ({node, ...props}) => <a className={`${message.type === 'user' ? 'text-blue-200 hover:text-blue-100' : 'text-amazon-blue hover:text-blue-700'} underline`} {...props} />,
                        code: ({node, inline, ...props}) => 
                          inline ? (
                            <code className={`${message.type === 'user' ? 'bg-blue-700/50' : 'bg-gray-100'} rounded px-1 py-0.5`} {...props} />
                          ) : (
                            <code className={`${message.type === 'user' ? 'bg-blue-700/50' : 'bg-gray-100'} block rounded-lg p-2 my-2 overflow-x-auto`} {...props} />
                          ),
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-1" {...props} />,
                        li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote 
                            className={`border-l-4 ${
                              message.type === 'user' 
                                ? 'border-blue-300 bg-blue-700/30' 
                                : 'border-gray-300 bg-gray-50'
                            } pl-4 py-1 my-2`} 
                            {...props} 
                          />
                        ),
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold my-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold my-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold my-1" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-2">
                            <table className="min-w-full border-collapse" {...props} />
                          </div>
                        ),
                        th: ({node, ...props}) => (
                          <th 
                            className={`${
                              message.type === 'user' 
                                ? 'border border-blue-300/30 bg-blue-700/30' 
                                : 'border border-gray-200 bg-gray-50'
                            } px-2 py-1`} 
                            {...props} 
                          />
                        ),
                        td: ({node, ...props}) => (
                          <td 
                            className={`${
                              message.type === 'user' 
                                ? 'border border-blue-300/30' 
                                : 'border border-gray-200'
                            } px-2 py-1`} 
                            {...props} 
                          />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.requiresApproval && pendingApproval && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => handleApproval(true)}
                        className="bg-gradient-to-r from-amazon-yellow to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleApproval(false)}
                        className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-amazon-blue border-2 border-white flex items-center justify-center ml-2 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2">
                  <img src="/eye-icon.svg" alt="" className="w-5 h-5" />
                </div>
                <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-amazon-blue rounded-full animate-bounce opacity-75" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-amazon-blue rounded-full animate-bounce opacity-75" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-amazon-blue rounded-full animate-bounce opacity-75" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 rounded-b-lg shadow-lg">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={user ? "Type your message..." : "Please log in to chat"}
              disabled={!user || isActivating}
              className="w-full resize-none border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-amazon-blue focus:ring-1 focus:ring-amazon-blue disabled:bg-gray-50 disabled:cursor-not-allowed pr-12 text-sm"
              rows="2"
            />
            {inputMessage.trim() && (
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                Press Enter ↵
              </div>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!user || !inputMessage.trim() || isLoading || isActivating}
            className={`px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-all duration-200 ${
              !user || !inputMessage.trim() || isLoading || isActivating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amazon-blue to-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-amazon-blue'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrustAgent; 