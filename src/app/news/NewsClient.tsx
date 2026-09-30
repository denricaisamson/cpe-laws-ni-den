'use client';

import React, { useState, useEffect } from 'react';
import {
  NewsEventWithDetails,
  getNewsEvents,
  subscribeToCommunityStore,
} from '@/lib/community-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Newspaper,
  Calendar,
  MapPin,
  Sparkles,
  Tag,
  Search,
  Eye,
  X,
  VolumeX,
  CheckCircle2,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface NewsClientProps {
  initialNews?: NewsEventWithDetails[];
}

export function NewsClient({ initialNews }: NewsClientProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newsList, setNewsList] = useState<NewsEventWithDetails[]>(initialNews || []);
  const [selectedArticle, setSelectedArticle] = useState<NewsEventWithDetails | null>(null);

  const loadData = () => {
    const data = getNewsEvents(activeTab);
    setNewsList(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToCommunityStore(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [activeTab]);

  const filteredArticles = newsList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.category_label && item.category_label.toLowerCase().includes(q))
    );
  });

  const getCategoryBadgeClass = (type: string) => {
    switch (type) {
      case 'sdeas_news':
        return 'bg-blue-100 text-blue-950 border-blue-300';
      case 'deaf_festival':
        return 'bg-purple-100 text-purple-950 border-purple-300';
      case 'seminar':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
      case 'event':
      default:
        return 'bg-amber-100 text-amber-950 border-amber-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-amber-900">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/80 text-amber-200 text-xs font-bold border border-amber-600 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>FSL Community & SDEAS Information Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Community News & SDEAS Highlights 🤟
        </h1>
        <p className="text-amber-100 text-base font-medium mt-2 max-w-2xl">
          Stay updated with Deaf community celebrations, the annual Benilde Deaf Festival, academic developments at SDEAS, and nationwide FSL seminars under Republic Act 11106.
        </p>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border-2 border-slate-300 shadow-xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="News categories">
          {[
            { id: 'all', label: 'All Announcements' },
            { id: 'sdeas_news', label: 'SDEAS News' },
            { id: 'deaf_festival', label: 'Deaf Festival' },
            { id: 'events_seminars', label: 'Events & Seminars' },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isCurrent}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isCurrent
                    ? 'bg-blue-700 text-white border-2 border-blue-900 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search news & events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-slate-50 text-slate-900 rounded-lg border-2 border-slate-300 focus:border-blue-700 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 border-2 border-slate-300 text-center space-y-3">
            <Newspaper className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-lg font-black text-slate-900">No announcements found</h2>
            <p className="text-sm text-slate-600">
              Try adjusting your filter category or search keyword.
            </p>
          </div>
        ) : (
          filteredArticles.map((article) => {
            const formattedDate = new Date(article.date).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <Card
                key={article.id}
                className="border-2 border-slate-300 hover:border-slate-400 transition-all flex flex-col justify-between shadow-xs bg-white group cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div>
                  <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-black uppercase border ${getCategoryBadgeClass(
                          article.type
                        )}`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{article.category_label || article.type.replace('_', ' ')}</span>
                      </span>

                      <span className="flex items-center gap-1 text-xs font-bold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    <CardTitle className="text-xl font-black leading-snug group-hover:text-blue-700 transition-colors">
                      {article.title}
                    </CardTitle>

                    {article.location && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">{article.location}</span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-6 text-sm text-slate-700 font-medium leading-relaxed space-y-4">
                    <p>{article.body}</p>

                    {article.accommodations && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs font-bold text-amber-950">
                        <span className="text-base shrink-0">🤟</span>
                        <span>{article.accommodations}</span>
                      </div>
                    )}
                  </CardContent>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {article.organizer || 'SDEAS Community'}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArticle(article);
                    }}
                    className="font-bold text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span>View Details</span>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Article Detail Modal / Expander */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-article-title"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white rounded-2xl border-2 border-slate-400 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-100 p-6 border-b-2 border-slate-200 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-black uppercase border ${getCategoryBadgeClass(
                    selectedArticle.type
                  )}`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{selectedArticle.category_label || selectedArticle.type.replace('_', ' ')}</span>
                </span>
                <h2 id="modal-article-title" className="text-2xl font-black text-slate-900 leading-snug">
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close modal"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
              {/* Event Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <div className="text-slate-500 uppercase text-[10px]">Date / Schedule</div>
                    <div className="text-slate-900">{new Date(selectedArticle.date).toLocaleDateString('en-PH', { dateStyle: 'full' })}</div>
                  </div>
                </div>

                {selectedArticle.location && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="text-slate-500 uppercase text-[10px]">Venue / Location</div>
                      <div className="text-slate-900">{selectedArticle.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Article Content */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Announcement Content</h3>
                <p className="text-base text-slate-800 leading-relaxed font-medium">
                  {selectedArticle.body}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The Filipino Sign Language (FSL) Community Hub provides continuous learning, cultural advocacy, and institutional inclusion programs under the direction of the De La Salle-College of Saint Benilde School of Deaf Education and Applied Studies (SDEAS).
                </p>
              </div>

              {/* Accessibility Accommodations Section */}
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Accessibility Accommodations (RA 11106 Mandate)</span>
                </div>
                <p className="text-xs font-semibold text-emerald-900 leading-relaxed">
                  {selectedArticle.accommodations || 'Filipino Sign Language (FSL) interpreters are provided for all workshop participants and attendees.'}
                </p>
              </div>

              {/* Organizer Info */}
              {selectedArticle.organizer && (
                <div className="text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
                  Organized by: <span className="text-slate-900">{selectedArticle.organizer}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t-2 border-slate-200 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedArticle(null)}
                className="font-bold border-slate-300"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  alert(`Added "${selectedArticle.title}" to calendar!`);
                }}
                className="font-bold"
              >
                <Calendar className="w-4 h-4 mr-1.5" />
                <span>Add to Calendar</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
