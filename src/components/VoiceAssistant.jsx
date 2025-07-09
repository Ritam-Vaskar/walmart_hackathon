import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, Send, ShoppingCart, Loader2 } from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

const VoiceAssistant = () => {
  const {
    isListening,
    transcript,
    isProcessing,
    assistantResponse,
    isAssistantVisible,
    error,
    suggestions,
    startListening,
    stopListening,
    toggleAssistant,
    processTextCommand,
    addProductToCart,
    clearAssistant,
  } = useVoiceAssistant();

  const [textInput, setTextInput] = useState('');
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to bottom of chat when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [assistantResponse, transcript]);

  // Handle text input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      processTextCommand(textInput);
      setTextInput('');
    }
  };

  // Handle product click
  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
    toggleAssistant(); // Close assistant after navigating
  };

  // Handle add to cart
  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent navigation
    addProductToCart(product, 1);
  };

  // Floating microphone button (always visible)
  const renderFloatingButton = () => (
    <button
      onClick={toggleAssistant}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center justify-center"
      aria-label="Voice Assistant"
    >
      <Mic className="w-6 h-6" />
    </button>
  );

  // If assistant is not visible, only show the floating button
  if (!isAssistantVisible) {
    return renderFloatingButton();
  }

  return (
    <>
      {renderFloatingButton()}
      
      {/* Assistant Panel */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleAssistant}></div>
      <div className="fixed bottom-0 right-0 z-50 w-full md:w-96 bg-white rounded-t-2xl md:rounded-2xl shadow-xl transition-all duration-300 md:bottom-20 md:right-6 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Walmart Voice Assistant</h3>
          <button onClick={toggleAssistant} className="text-white hover:text-blue-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="p-4 h-80 overflow-y-auto flex flex-col space-y-4"
        >
          {/* Welcome Message */}
          {!transcript && !assistantResponse && (
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] self-start">
              <p>Hi there! How can I help with your shopping today?</p>
            </div>
          )}

          {/* User's transcript */}
          {transcript && (
            <div className="bg-blue-100 rounded-lg p-3 max-w-[80%] self-end">
              <p>{transcript}</p>
            </div>
          )}

          {/* Assistant's response */}
          {assistantResponse && (
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] self-start">
              <p>{assistantResponse.message}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg p-3 max-w-[80%] self-start">
              <p>{error}</p>
            </div>
          )}

          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Product Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <h4 className="font-medium text-gray-700 mb-3">Suggestions:</h4>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {suggestions.map((product) => (
                <div 
                  key={product._id} 
                  onClick={() => handleProductClick(product)}
                  className="flex items-center border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <h5 className="font-medium text-sm text-gray-800">{product.name}</h5>
                    <p className="text-blue-600 font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-full"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3">
          <form onSubmit={handleSubmit} className="flex items-center">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 border border-gray-300 rounded-l-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-full py-2 px-4"
              disabled={isProcessing}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Voice Controls */}
          <div className="flex justify-center mt-3">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Start Listening</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceAssistant;