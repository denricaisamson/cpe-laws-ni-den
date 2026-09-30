'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Profile,
  Message,
  MessageWithProfiles,
  UserRole,
} from '@/types/database';
import {
  getCommunityProfiles,
  getConversations,
  getMessageThread,
  sendMessage,
  markThreadAsRead,
  subscribeToCommunityStore,
  ConversationSummary,
} from '@/lib/community-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  MessageSquare,
  Send,
  User,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  Users,
  Search,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';

interface MessagesClientProps {
  initialUserId: string;
  initialRole?: UserRole;
  initialUserName?: string;
}

export function MessagesClient({
  initialUserId,
  initialRole = 'learner',
  initialUserName = 'User',
}: MessagesClientProps) {
  // Current active identity (can be switched for local interactive testing)
  const [activeUserId, setActiveUserId] = useState<string>(initialUserId);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string>('');
  const [activeThread, setActiveThread] = useState<MessageWithProfiles[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRecipientSelector, setShowRecipientSelector] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load profiles and conversations
  const refreshData = () => {
    const allProfiles = getCommunityProfiles();
    setProfiles(allProfiles);

    const convList = getConversations(activeUserId);
    setConversations(convList);

    // If no active partner is selected, choose the first conversation partner
    if (!activePartnerId && convList.length > 0) {
      const defaultPartner = convList[0].partner.id;
      setActivePartnerId(defaultPartner);
      markThreadAsRead(activeUserId, defaultPartner);
      setActiveThread(getMessageThread(activeUserId, defaultPartner));
    } else if (activePartnerId) {
      markThreadAsRead(activeUserId, activePartnerId);
      setActiveThread(getMessageThread(activeUserId, activePartnerId));
    }
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToCommunityStore(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [activeUserId]);

  useEffect(() => {
    if (activePartnerId) {
      markThreadAsRead(activeUserId, activePartnerId);
      setActiveThread(getMessageThread(activeUserId, activePartnerId));
    }
  }, [activePartnerId, activeUserId]);

  // Scroll to bottom when thread updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread]);

  const activeProfile = profiles.find((p) => p.id === activeUserId);
  const activePartner = profiles.find((p) => p.id === activePartnerId);

  const handleSelectPartner = (partnerId: string) => {
    setActivePartnerId(partnerId);
    markThreadAsRead(activeUserId, partnerId);
    setActiveThread(getMessageThread(activeUserId, partnerId));
    setShowRecipientSelector(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activePartnerId) return;

    try {
      sendMessage(activeUserId, activePartnerId, messageInput.trim());
      setMessageInput('');
      setToastMessage('Message sent successfully!');
      setTimeout(() => setToastMessage(null), 2500);

      // Refresh thread immediately
      setActiveThread(getMessageThread(activeUserId, activePartnerId));
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filtered conversations by search query
  const filteredConversations = conversations.filter((c) =>
    c.partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.partner.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 right-4 z-50 bg-emerald-800 text-white px-5 py-3 rounded-xl border-2 border-emerald-950 shadow-xl flex items-center gap-2 font-bold animate-fade-in"
        >
          <CheckCheck className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Role Switcher Bar */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black border border-blue-300 mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>FSL Direct Messaging Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Consultation Messages & Class Q&A 🤟
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Exchange direct text messages between Learners, Professors, and Administrators with real-time sync.
          </p>
        </div>

        {/* Quick Role Switcher (for preview/testing) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200">
          <span className="text-xs font-black text-slate-600 uppercase flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>Current Role:</span>
          </span>
          <select
            value={activeUserId}
            onChange={(e) => setActiveUserId(e.target.value)}
            aria-label="Switch active conversation role"
            className="text-xs font-bold bg-white text-slate-900 border-2 border-slate-300 rounded-lg px-2.5 py-1.5 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* Left: Conversation List Sidebar (4 cols on lg) */}
        <Card className="lg:col-span-4 border-2 border-slate-300 flex flex-col h-[650px] shadow-xs">
          <CardHeader className="bg-slate-50 border-b border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black">Conversations</CardTitle>
                <CardDescription className="text-xs">
                  Active consultations & threads
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecipientSelector(!showRecipientSelector)}
                className="text-xs font-bold border-slate-300"
                title="Start new consultation"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-blue-700" />
                <span>New</span>
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-white text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none"
              />
            </div>
          </CardHeader>

          {/* Quick Recipient Picker Drawer (when New is clicked) */}
          {showRecipientSelector && (
            <div className="p-3 bg-blue-50 border-b-2 border-blue-200 space-y-2">
              <span className="text-[11px] font-black text-blue-900 uppercase">
                Select conversation partner:
              </span>
              <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto">
                {profiles
                  .filter((p) => p.id !== activeUserId)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPartner(p.id)}
                      className="text-left p-2 rounded-lg bg-white hover:bg-blue-100 border border-slate-200 text-xs font-bold text-slate-900 flex items-center justify-between"
                    >
                      <span className="truncate">{p.name}</span>
                      <Badge variant={p.role} className="text-[9px] px-1 py-0" />
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Conversation List Items */}
          <CardContent className="p-2 space-y-1.5 flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold">No conversations found</p>
                <p className="text-[11px] text-slate-400">
                  Click &quot;+ New&quot; above to start chatting with teachers, learners, or admins.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.partner.id === activePartnerId;
                const formattedTime = new Date(conv.lastMessage.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <button
                    key={conv.partner.id}
                    type="button"
                    onClick={() => handleSelectPartner(conv.partner.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {/* Partner Avatar / Initial */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-black text-sm text-slate-700">
                        {conv.partner.name.charAt(0)}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-700 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Conversation Content Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {conv.partner.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant={conv.partner.role} className="text-[9px] px-1 py-0 leading-none" />
                      </div>

                      <p className="text-[11px] font-medium text-slate-600 truncate">
                        {conv.lastMessage.body}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right: Active Message Thread Pane (8 cols on lg) */}
        <Card className="lg:col-span-8 border-2 border-slate-300 flex flex-col h-[650px] shadow-xs">
          {/* Thread Header */}
          <CardHeader className="bg-slate-50 border-b-2 border-slate-200 p-4 flex flex-row items-center justify-between">
            {activePartner ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center font-black text-base text-blue-900">
                  {activePartner.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-black text-slate-900">
                      {activePartner.name}
                    </CardTitle>
                    <Badge variant={activePartner.role} className="text-[10px]" />
                  </div>
                  <CardDescription className="text-xs font-semibold text-slate-500">
                    {activePartner.email} • {activePartner.bio || 'FSL Community Member'}
                  </CardDescription>
                </div>
              </div>
            ) : (
              <div>
                <CardTitle className="text-base font-black">Direct Messages</CardTitle>
                <CardDescription className="text-xs">Select a conversation from the sidebar</CardDescription>
              </div>
            )}

            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Active Consultation</span>
            </div>
          </CardHeader>

          {/* Message History Bubble Feed */}
          <CardContent className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto bg-slate-50/50">
            {activeThread.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-2xl">
                  🤟
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Start a conversation with {activePartner?.name || 'this contact'}
                  </h2>
                  <p className="text-xs font-medium text-slate-600 mt-1 max-w-sm">
                    Inquire about FSL signs, fingerspelling clarification, schedule appointments, or feedback.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMessageInput('Hello! Could you clarify the handshape orientation for this week\'s lesson?')}
                    className="text-xs font-bold px-3 py-1.5 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-700 transition-colors"
                  >
                    &ldquo;Hello! Clarify handshape orientation?&rdquo;
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageInput('Good day! Are there any supplementary FSL practice videos for Level 1?')}
                    className="text-xs font-bold px-3 py-1.5 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-700 transition-colors"
                  >
                    &ldquo;Supplementary practice videos?&rdquo;
                  </button>
                </div>
              </div>
            ) : (
              activeThread.map((msg) => {
                const isMine = msg.sender_id === activeUserId;
                const senderProfile = msg.sender || profiles.find((p) => p.id === msg.sender_id);
                const timeString = new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender Identity & Role Badge */}
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-black text-slate-700">
                        {isMine ? 'You' : senderProfile?.name || 'Partner'}
                      </span>
                      {senderProfile?.role && (
                        <Badge variant={senderProfile.role} className="text-[9px] px-1 py-0" />
                      )}
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`max-w-lg p-3.5 rounded-2xl border-2 text-sm font-medium leading-relaxed shadow-xs ${
                        isMine
                          ? 'bg-blue-700 text-white border-blue-900 rounded-br-none'
                          : 'bg-white text-slate-900 border-slate-300 rounded-bl-none'
                      }`}
                    >
                      {msg.body}
                    </div>

                    {/* Timestamp & Read Status */}
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mt-1 px-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeString}</span>
                      {isMine && (
                        <span className="ml-1 inline-flex items-center text-blue-700" title="Delivered & Read">
                          {msg.read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600" aria-label="Read" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" aria-label="Delivered" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Compose Bar */}
          <div className="p-4 border-t-2 border-slate-200 bg-slate-50">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activePartner
                    ? `Message ${activePartner.name}... (Press Enter to send)`
                    : 'Select a conversation partner...'
                }
                disabled={!activePartnerId}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-white text-slate-900 font-medium rounded-xl border-2 border-slate-300 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed placeholder:text-slate-400"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!messageInput.trim() || !activePartnerId}
                className="font-bold min-h-[44px] px-5"
              >
                <Send className="w-4 h-4 mr-1.5" />
                <span>Send</span>
              </Button>
            </form>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-2 px-1">
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded border border-slate-300 text-slate-800">Enter</kbd> to send instantly</span>
              <span>Protected under RA 11106 Accessibility Communication Guidelines</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
