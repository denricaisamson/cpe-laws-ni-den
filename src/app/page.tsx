import Link from 'next/link';
import { mockWorkshops, mockVideos, mockNewsEvents, mockProducts } from '@/lib/mock-data';
import { formatPHP } from '@/lib/utils';
import { BookOpen, Video, Newspaper, ShoppingBag, ArrowRight } from 'lucide-react';
import { getServerUserSession } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { DemoRoleBanner } from '@/components/layout/DemoRoleBanner';

export default async function HomePage() {
  const session = await getServerUserSession();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoRoleBanner currentRole={session?.role} currentUserName={session?.profile.name} />
      <Navbar currentRole={session?.role} currentUserName={session?.profile.name} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-sm font-bold">
          <span>⭐ De La Salle • SDEAS Accessible Deaf & FSL Education Platform</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Filipino Sign Language Workshop System
        </h1>
        <p className="text-lg text-slate-700 leading-relaxed">
          Centralized online learning hub for FSL learners, professors, and administrators. Manage workshop schedules, verify payments, track assignments, and explore signing tutorial libraries.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-md transition-colors focus:ring-4 focus:ring-blue-300"
          >
            Access Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-medium transition-colors"
          >
            Register as Learner
          </Link>
        </div>
      </div>

      {/* Featured Workshops */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-700" />
            <h2 className="text-2xl font-bold text-slate-900">Featured FSL Workshops</h2>
          </div>
          <span className="text-sm font-semibold text-slate-600">Levels 1, 2 & 3</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 mb-3">
                  Level {workshop.level}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{workshop.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{workshop.description}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{formatPHP(workshop.fee)}</span>
                <span className="text-xs text-slate-500 font-medium">Standard Tuition</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Video Hub Categories Teaser */}
      <section className="mt-16">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-6 h-6 text-emerald-700" />
          <h2 className="text-2xl font-bold text-slate-900">Tutorial Video Library</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockVideos.map((video) => (
            <div key={video.id} className="bg-white border-2 border-slate-200 rounded-xl p-5">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {video.category}
              </span>
              <h4 className="font-bold text-slate-900 mt-2 mb-1 line-clamp-1">{video.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{video.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community News & Merchandise Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        {/* News */}
        <section className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-5 h-5 text-amber-600" />
            <h3 className="text-xl font-bold text-slate-900">Community News & SDEAS</h3>
          </div>
          <div className="space-y-4">
            {mockNewsEvents.slice(0, 2).map((item) => (
              <div key={item.id} className="border-b border-slate-100 last:border-0 pb-3">
                <span className="text-xs font-bold uppercase text-amber-700">{item.type}</span>
                <h4 className="font-semibold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Merchandise */}
        <section className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h3 className="text-xl font-bold text-slate-900">FSL Merchandise</h3>
          </div>
          <div className="space-y-4">
            {mockProducts.slice(0, 2).map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">{product.name}</h4>
                  <p className="text-xs text-slate-500">In Stock: {product.stock} units</p>
                </div>
                <span className="font-bold text-slate-900">{formatPHP(product.price)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
    </div>
  );
}
