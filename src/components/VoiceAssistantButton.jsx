import React from 'react';
import { Mic } from 'lucide-react';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

const VoiceAssistantButton = () => {
  const { toggleAssistant } = useVoiceAssistant();

  return (
    <button
      onClick={toggleAssistant}
      className="relative flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label="Voice Assistant"
    >
      <div className="relative">
        <Mic className="w-6 h-6 text-gray-600" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
      </div>
      <span className="text-xs text-gray-600 hidden md:block">Assistant</span>
    </button>
  );
};

export default VoiceAssistantButton;