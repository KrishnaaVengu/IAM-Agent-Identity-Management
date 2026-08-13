import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot } from 'lucide-react';
import apiClient from '../api/client';

interface Message {
 id: string;
 sender: 'user' | 'agent';
 text: string;
}

const SupportAgentChat: React.FC = () => {
 const [isOpen, setIsOpen] = useState(false);
 const [messages, setMessages] = useState<Message[]>([
 {
 id: '1',
 sender: 'agent',
 text: 'Hello! I am the AIM Support Agent. How can I help you manage your agent identities, scopes, or credentials today?',
 },
 ]);
 const [inputValue, setInputValue] = useState('');
 const [isTyping, setIsTyping] = useState(false);

 const messagesEndRef = useRef<HTMLDivElement>(null);
 const inputRef = useRef<HTMLInputElement>(null);
 const containerRef = useRef<HTMLDivElement>(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 // Auto-scroll when messages update, typing state changes, or window opens
 useEffect(() => {
 if (isOpen) {
 scrollToBottom();
 }
 }, [messages, isTyping, isOpen]);

 // Auto-focus input when chat opens
 useEffect(() => {
 if (isOpen) {
 setTimeout(() => {
 inputRef.current?.focus();
 }, 50);
 }
 }, [isOpen]);

 // Click outside to close chat
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 };

 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside);
 }

 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, [isOpen]);

 const handleSend = async () => {
 if (!inputValue.trim()) return;

 const userMessage: Message = {
 id: Date.now().toString(),
 sender: 'user',
 text: inputValue.trim(),
 };

 const newMessages = [...messages, userMessage];
 setMessages(newMessages);
 setInputValue('');
 setIsTyping(true);

 try {
 const data = (await apiClient.post('/chat', {
 messages: newMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }))
 })) as any;
 
 const agentMessage: Message = {
 id: Date.now().toString() + '-agent',
 sender: 'agent',
 text: data.reply || data.message || 'Sorry, I could not process that request.',
 };
 
 setMessages((prev) => [...prev, agentMessage]);
 } catch (error) {
 console.error('Chat API Error:', error);
 const errorMessage: Message = {
 id: Date.now().toString() + '-error',
 sender: 'agent',
 text: 'Sorry, I am having trouble connecting to my backend. Please try again later.',
 };
 setMessages((prev) => [...prev, errorMessage]);
 } finally {
 setIsTyping(false);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
 if (e.key === 'Enter') {
 handleSend();
 }
 };

 return (
 <div id="tour-ai-support" className={`fixed z-50 font-sans transition-all ${isOpen ? 'bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6' : 'bottom-6 right-6'}`} ref={containerRef}>
 {!isOpen && (
 <button
 onClick={() => setIsOpen(true)}
 className="bg-slate-900 text-white rounded-full p-4 shadow-2xl hover:bg-slate-800 transition-colors focus:outline-none flex items-center justify-center cursor-pointer border border-slate-700/50"
 aria-label="Open support chat"
 >
 <Bot className="w-6 h-6" />
 </button>
 )}

 {isOpen && (
 <div className="w-full h-[85vh] sm:w-96 sm:h-[480px] bg-white sm:border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col origin-bottom-right transition-all overflow-hidden">
 {/* Header */}
 <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800 shrink-0">
 <div className="flex items-center gap-2">
 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="font-semibold text-sm">AIM Support Agent</span>
 </div>
 <button
 onClick={() => setIsOpen(false)}
 className="text-slate-400 hover:text-white transition-colors cursor-pointer"
 aria-label="Close chat"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Messages Area */}
 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 ">
 {messages.map((msg) => (
 <div
 key={msg.id}
 className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
 >
 <div
 className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
 msg.sender === 'user'
 ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm'
 : 'bg-slate-200 text-slate-800 rounded-bl-sm shadow-sm border border-slate-300 '
 }`}
 >
 {msg.text}
 </div>
 </div>
 ))}
 {isTyping && (
 <div className="flex justify-start">
 <div className="bg-slate-200 text-slate-500 border border-slate-300 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-2">
 <Loader2 className="w-4 h-4 animate-spin" />
 <span className="text-xs font-medium">Agent is typing...</span>
 </div>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input Area */}
 <div className="p-3 bg-white border-t border-slate-200 shrink-0">
 <div className="flex items-center gap-2 relative">
 <input
 ref={inputRef}
 type="text"
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder="Ask me anything..."
 className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
 />
 <button
 onClick={handleSend}
 disabled={!inputValue.trim() || isTyping}
 className="absolute right-1 p-1.5 text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
 aria-label="Send message"
 >
 <Send className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default SupportAgentChat;
