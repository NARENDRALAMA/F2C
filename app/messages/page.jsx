'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronRight } from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/messages')
      .then((r) => setConversations(r.data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading || loading) return <Spinner className="py-20" size="lg" />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <MessageSquare className="w-7 h-7 text-green-600" /> Messages
      </h1>
      <p className="text-gray-600 mb-8">Your conversations with farmers and consumers.</p>

      {conversations.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No messages yet.</p>
          <p className="text-sm mt-1">Start a conversation from any product or farmer profile page.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <button
              key={c.conversationId}
              onClick={() => router.push(`/messages/${c.conversationId}`)}
              className="w-full card flex items-center gap-4 text-left hover:border-green-200 transition-colors"
            >
              {c.other?.avatar ? (
                <img src={c.other.avatar} alt={c.other.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 shrink-0">
                  {(c.other?.farmName || c.other?.name)?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">
                  {c.other?.farmName || c.other?.name}
                  <span className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${
                    c.other?.role === 'farmer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>{c.other?.role}</span>
                </p>
                <p className="text-sm text-gray-500 truncate">{c.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {c.unread > 0 && (
                  <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {c.unread}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(c.lastAt).toLocaleDateString()}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
