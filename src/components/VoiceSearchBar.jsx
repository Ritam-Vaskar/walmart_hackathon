import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VoiceSearchBar = ({ className }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
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
        setSearchQuery(transcriptText);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          handleSearch({ preventDefault: () => {} });
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
  }, [transcript]);

  // Start listening
  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsProcessing(true);
      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      newParams.set('search', searchQuery.trim());
      setSearchParams(newParams);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Search products...'}
          className={`w-full px-4 py-3 pl-12 border-2 ${isListening ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all`}
          disabled={isListening}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        
        {/* Voice search button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`absolute right-16 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'} hover:opacity-90 transition-colors`}
          disabled={isProcessing}
          aria-label={isListening ? 'Stop listening' : 'Search with voice'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        
        {/* Search button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-full text-sm font-medium transition-colors"
          disabled={isProcessing || isListening}
        >
          {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </div>
      
      {error && (
        <div className="absolute mt-1 text-xs text-red-500">
          {error}
        </div>
      )}
    </form>
  );
};

export default VoiceSearchBar;