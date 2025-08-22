import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m the AI Assistant for Kumbh Mela 2027 crowd management. I can help you with route planning, safety guidance, crowd density information, and emergency assistance. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sessionIdRef = useRef<string>(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const WEBHOOK_URL = (import.meta as any).env?.DEV ? '/api/chat' : 'https://gaurav18.app.n8n.cloud/webhook/chatbot';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const predefinedResponses = [
    "Based on current crowd density data, I recommend taking the alternative route via Godavari Ghat which has 40% less congestion right now.",
    "The risk level at Triveni Sangam is currently HIGH. I suggest visiting between 10-11 AM or after 6 PM for safer conditions.",
    "Emergency services have been alerted. Please move to the nearest safe zone marked in green on your map. Help will arrive in 8-10 minutes.",
    "The best bathing time today is 6:30 AM when crowd density will be at its lowest. Would you like me to set a reminder?",
    "I've analyzed the crowd flow patterns. The shortest route to your destination will take approximately 25 minutes considering current conditions."
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userInput,
          sessionId: sessionIdRef.current,
          history: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      let replyText = '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        replyText = data.reply || data.message || data.text || data.output || data.result || (Array.isArray(data) ? data[0] : '');
        if (!replyText) replyText = JSON.stringify(data);
      } else {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          replyText = json.reply || json.message || json.text || text;
        } catch {
          replyText = text;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: replyText || 'Sorry, I could not understand the response.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const fallback = predefinedResponses[Math.floor(Math.random() * predefinedResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I had trouble reaching the assistant. ' + fallback,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Simulate voice recognition
    if (!isListening) {
      setTimeout(() => {
        setInput("What's the safest route to Ramkund Ghat?");
        setIsListening(false);
      }, 3000);
    }
  };

  const handleSpeakToggle = () => {
    setIsSpeaking(!isSpeaking);
    // Simulate text-to-speech
    if (!isSpeaking) {
      setTimeout(() => {
        setIsSpeaking(false);
      }, 3000);
    }
  };

  const quickQuestions = [
    "What's the crowd status?",
    "Safest route to temple?",
    "Emergency services?",
    "Best bathing time?"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-kumbh-saffron" />
            AI Crowd Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeakToggle}
              className={isSpeaking ? "bg-kumbh-saffron/10" : ""}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-kumbh-saffron text-white'
                    : 'bg-accent text-accent-foreground'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'assistant' && (
                    <div className="w-6 h-6 bg-kumbh-spiritual-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-accent rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-kumbh-spiritual-blue rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-kumbh-saffron rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-kumbh-saffron rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-kumbh-saffron rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crowd status, routes, safety..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-12"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceToggle}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                isListening ? "bg-red-100 text-red-600" : ""
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button onClick={handleSendMessage} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {isListening && (
          <div className="mt-2 text-center">
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
              Listening...
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAssistant;