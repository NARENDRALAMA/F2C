'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, MoreVertical } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';
import toast from 'react-hot-toast';

export default function ConversationPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const justSentRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  const scrollToBottom = (force = false) => {
    const el = scrollRef.current;
    if (!el) return;
    if (force || isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    isAtBottomRef.current = nearBottom;
  };

  const loadMessages = useCallback(async (isInitial = false) => {
    try {
      const res = await api.get(`/messages/${conversationId}`);
      const newMsgs = res.data.messages || [];
      setMessages(newMsgs);
      if (isInitial || justSentRef.current) {
        justSentRef.current = false;
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        setTimeout(() => scrollToBottom(false), 50);
      }
    } catch {
      if (loading) toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (isAuthenticated) loadMessages(true);
  }, [isAuthenticated, conversationId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => loadMessages(false), 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, loadMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    justSentRef.current = true;
    try {
      const parts = conversationId.split('_');
      const otherId = parts[0] === user._id ? parts[1] : parts[0];
      await api.post('/messages', { receiverId: otherId, content: text.trim() });
      setText('');
      await loadMessages(false);
    } catch {
      toast.error('Failed to send');
      justSentRef.current = false;
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const other = messages.find((m) => {
    const sid = m.sender?._id || m.sender;
    return sid?.toString() !== user?._id?.toString();
  })?.sender;

  const otherName = other?.farmName || other?.name || 'Conversation';

  if (authLoading || loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', paddingTop: '1.5rem', paddingBottom: '1.5rem', boxSizing: 'border-box' }}>
      <div className="flex flex-col h-full rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-gray-200 shrink-0">
          <button
            onClick={() => router.push('/messages')}
            className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-gray-100 transition-colors mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {other?.avatar ? (
            <div className="relative">
              <img src={other.avatar} alt={otherName} className="w-10 h-10 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            </div>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                {otherName[0]?.toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 leading-tight truncate">{otherName}</p>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0"
          style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0fdf4 100%)' }}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Send className="w-7 h-7 text-green-400" />
              </div>
              <p className="font-medium text-gray-500">No messages yet</p>
              <p className="text-sm mt-1">Send a message to start the conversation</p>
            </div>
          )}

          {messages.map((m, i) => {
            const sid = m.sender?._id || m.sender;
            const isMine = sid?.toString() === user?._id?.toString();
            const senderAvatar = m.sender?.avatar;
            const senderInitial = (m.sender?.farmName || m.sender?.name || '?')[0]?.toUpperCase();

            const prevMsg = messages[i - 1];
            const prevSid = prevMsg?.sender?._id || prevMsg?.sender;
            const isGrouped = prevSid?.toString() === sid?.toString();

            return (
              <div key={m._id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-3'}`}>
                {/* Other's avatar */}
                {!isMine && (
                  isGrouped ? (
                    <div className="w-8 shrink-0" />
                  ) : senderAvatar ? (
                    <img src={senderAvatar} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-700 shrink-0 shadow-sm">
                      {senderInitial}
                    </div>
                  )
                )}

                {/* Bubble */}
                <div className={`group relative max-w-xs lg:max-w-sm xl:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMine
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                  }`}>
                    {m.product && (
                      <p className={`text-xs mb-1 font-medium ${isMine ? 'text-green-200' : 'text-green-600'}`}>
                        Re: {m.product.name}
                      </p>
                    )}
                    <p className="leading-relaxed break-words">{m.content}</p>
                  </div>
                  <span className={`text-xs mt-1 px-1 ${isMine ? 'text-gray-400' : 'text-gray-400'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* My avatar */}
                {isMine && (
                  isGrouped ? (
                    <div className="w-8 shrink-0" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shrink-0 shadow-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* ── Input ── */}
        <div className="px-4 py-3 bg-white border-t border-gray-200 shrink-0">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); }}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 border-0 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              autoFocus
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="w-10 h-10 flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full transition-colors shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
