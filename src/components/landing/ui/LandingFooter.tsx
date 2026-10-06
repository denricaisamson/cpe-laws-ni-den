import Link from 'next/link';
import { Hand, Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#020b06] text-white/70 py-14 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-emerald-400 text-emerald-950">
              <Hand className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-xl tracking-tight">
              Filipino Sign Language <span className="text-amber-300">Portal</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 max-w-sm leading-relaxed">
            Empowering the Deaf community through visual-spatial education, digital workshop administration, and professional interpreter pathways under De La Salle - College of Saint Benilde SDEAS.
          </p>
          <div className="text-xs text-emerald-400/90 font-medium flex items-center gap-1.5 pt-2">
            <span>Built with respect for the Deaf and FSL community</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
            Platform Navigation
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link href="/learner/workshops" className="hover:text-emerald-300 transition-colors">
                Workshop Catalog
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-emerald-300 transition-colors">
                SDEAS Community News
              </Link>
            </li>
            <li>
              <Link href="/merchandise" className="hover:text-emerald-300 transition-colors">
                Advocacy Merchandise
              </Link>
            </li>
            <li>
              <Link href="/messages" className="hover:text-emerald-300 transition-colors">
                Direct Messaging
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
            Access Portals
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            <li>
              <Link href="/login" className="hover:text-emerald-300 transition-colors">
                Learner / Faculty Sign In
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-emerald-300 transition-colors">
                Student Registration
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-emerald-300 transition-colors">
                Administration Console
              </Link>
            </li>
            <li>
              <Link href="/professor" className="hover:text-emerald-300 transition-colors">
                Professor Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
        <span>
          © {new Date().getFullYear()} Filipino Sign Language Workshop System. All rights reserved.
        </span>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400">WCAG AAA Accessibility</span>
          <span>•</span>
          <span>Next.js 14 App Router</span>
          <span>•</span>
          <span>Supabase Cloud</span>
        </div>
      </div>
    </footer>
  );
}
