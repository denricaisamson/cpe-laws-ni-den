'use client';

import { Newspaper, ShoppingBag, ArrowRight, Tag, Calendar, MapPin } from 'lucide-react';
import { formatPHP, formatDate } from '@/lib/utils';
import type { NewsEvent, Product } from '@/types/database';
import Link from 'next/link';

interface CommunityMerchSectionProps {
  news: NewsEvent[];
  products: Product[];
}

export function CommunityMerchSection({ news, products }: CommunityMerchSectionProps) {
  return (
    <section id="community" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Newspaper className="w-3.5 h-3.5 text-rose-400" />
          <span>Deaf Culture & Advocacy</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Community News, Events & Merchandise
        </h2>
        <p className="text-emerald-100/75 text-base sm:text-lg leading-relaxed">
          Celebrate Deaf festivals, attend seminars, and support Deaf advocacy merchandise.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: News & Events */}
        <div className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Latest Announcements</h3>
                <span className="text-xs text-white/50">SDEAS Community Updates</span>
              </div>
            </div>
            <Link
              href="/news"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                    {item.type}
                  </span>
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(item.date)}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1.5 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.body}
                </p>
                {item.location && (
                  <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Merchandise Catalog Teaser */}
        <div className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Advocacy Merchandise</h3>
                <span className="text-xs text-white/50">Proceeds Support Deaf Programs</span>
              </div>
            </div>
            <Link
              href="/merchandise"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
            >
              View catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {product.category || 'Advocacy'}
                    </span>
                    <span className="text-[10px] text-white/50">
                      {product.stock} in stock
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    {product.description || 'Official FSL advocacy item.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-base font-black text-amber-300">
                    {formatPHP(product.price)}
                  </span>
                  <Link
                    href="/merchandise"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-emerald-500 hover:text-white text-white/80 transition-colors"
                    title="View details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
