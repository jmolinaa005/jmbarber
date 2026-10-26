import { Scissors, Instagram, Phone, MapPin } from 'lucide-react';
import { useLang } from '@/LanguageContext';

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="bg-ink-900 border-t border-ink-500/40 relative">
      <div className="absolute inset-0 bg-brick-texture opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-6 h-6 text-brick-500" />
              <span className="font-display font-700 uppercase tracking-wider text-lg">
                JM <span className="text-brick-500">Barber</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">{t('footer.tagline')}</p>
            <p className="mt-3 text-xs uppercase tracking-wide text-white/40">
              {t('footer.madeIn')}
            </p>
          </div>

          <div>
            <p className="font-display font-600 uppercase text-sm tracking-wide text-white/80 mb-4">
              {t('nav.services')}
            </p>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'services', key: 'nav.services' },
                { id: 'athome', key: 'nav.athome' },
                { id: 'gallery', key: 'nav.gallery' },
                { id: 'about', key: 'nav.about' },
              ].map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => go(n.id)}
                    className="text-white/60 hover:text-brick-400 transition-colors"
                  >
                    {t(n.key)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display font-600 uppercase text-sm tracking-wide text-white/80 mb-4">
              {t('nav.contact')}
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://wa.me/34676759246"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-brick-400 transition-colors"
                >
                  <Phone className="w-4 h-4" /> +34 676 75 92 46
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/jm.barber.24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-brick-400 transition-colors"
                >
                  <Instagram className="w-4 h-4" /> @jm.barber.24
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/60">
                <MapPin className="w-4 h-4" /> Mas Montells, Blanes
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-ink-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {year} JM Barber · Joan Molina Adell · {t('footer.rights')}
          </p>
          <p className="text-xs text-white/30 uppercase tracking-wider">Blanes · Girona</p>
        </div>
      </div>
    </footer>
  );
}
