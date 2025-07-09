import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import axios from 'axios';

const VoiceAssistantContext = createContext(undefined);

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (context === undefined) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};

export const VoiceAssistantProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState(null);
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const recognitionRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      // Using webkit speech recognition for broader browser support
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceCommand(transcript);
        }
      };
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
      }
    };
  }, []);
  
  // Start listening
  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setAssistantResponse(null);
      recognitionRef.current.start();
    }
  };
  
  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  // Toggle assistant visibility
  const toggleAssistant = () => {
    setIsAssistantVisible(prev => !prev);
    if (!isAssistantVisible && !assistantResponse) {
      // Provide a welcome message when opening the assistant for the first time
      setAssistantResponse({
        type: 'general_response',
        message: "Hi there! I'm your Walmart shopping assistant. How can I help you today?"
      });
    }
  };
  
  // Process voice command
  const processVoiceCommand = async (command) => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    try {
      // Send the voice command to the backend for processing
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: command,
        userId: user?.id
      });
      
      setAssistantResponse(response.data);
      
      // Handle different response types
      handleAssistantResponse(response.data);
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      setAssistantResponse({
        type: 'error',
        message: 'Sorry, I had trouble understanding that. Could you try again?'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process text command (for typing instead of speaking)
  const processTextCommand = async (command) => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    setTranscript(command);
    
    try {
      // Send the text command to the backend for processing
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: command,
        userId: user?.id
      });
      
      setAssistantResponse(response.data);
      
      // Handle different response types
      handleAssistantResponse(response.data);
      
    } catch (error) {
      console.error('Error processing text command:', error);
      setAssistantResponse({
        type: 'error',
        message: 'Sorry, I had trouble understanding that. Could you try again?'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle different types of assistant responses
  const handleAssistantResponse = (response) => {
    switch (response.type) {
      case 'product_results':
        // Set product suggestions
        setSuggestions(response.products || []);
        break;
        
      case 'cart_updated':
        // Clear suggestions after adding to cart
        setSuggestions([]);
        break;
        
      case 'auth_required':
        // Clear suggestions for auth required responses
        setSuggestions([]);
        break;
        
      default:
        // Clear suggestions for other response types
        setSuggestions([]);
    }
  };
  
  // Add a product to cart directly from the assistant
  const addProductToCart = async (product, quantity = 1) => {
    if (!user) {
      setAssistantResponse({
        type: 'auth_required',
        message: 'Please log in to add items to your cart.'
      });
      return;
    }
    
    try {
      await addToCart(product, quantity);
      
      setAssistantResponse({
        type: 'cart_updated',
        message: `Added ${quantity} ${product.name} to your cart.`,
        product: product
      });
      
      setSuggestions([]);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      setAssistantResponse({
        type: 'error',
        message: 'Sorry, I had trouble adding that item to your cart.'
      });
    }
  };
  
  // Clear the assistant state
  const clearAssistant = () => {
    setTranscript('');
    setAssistantResponse(null);
    setSuggestions([]);
    setError(null);
  };
  
  return (
    <VoiceAssistantContext.Provider
      value={{
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
        processVoiceCommand,
        processTextCommand,
        addProductToCart,
        clearAssistant,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};