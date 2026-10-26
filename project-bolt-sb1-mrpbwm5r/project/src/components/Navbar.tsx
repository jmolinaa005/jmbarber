import { useEffect, useState } from 'react';
import { Scissors, Menu, X, Calendar, Lock } from 'lucide-react';
import { useLang } from '@/LanguageContext';
import type { Lang } from '@/i18n';

type Props = {
  onBook: () => void;
  onAdmin: () => void;
};

const navItems = [
  { id: 'home', key: 'nav.home' },
  { id: 'services', key: 'nav.services' },
  { id: 'about', key: 'nav.about' },
  { id: 'athome', key: 'nav.athome' },
  { id: 'gallery', key: 'nav.gallery' },
  { id: 'location', key: 'nav.location' },
  { id: 'contact', key: 'nav.contact' },
];

const languages: { code: Lang; label: string }[] = [
  { code: 'ca', label: 'CA' },
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

export default function Navbar({ onBook, onAdmin }: Props) {
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-900/95 backdrop-blur-md border-b border-ink-500/60'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2 group shrink-0"
          aria-label="JM Barber"
        >
          <span className="relative">
            <Scissors className="w-7 h-7 text-brick-500 transition-transform group-hover:rotate-12" />
          </span>
          <span className="font-display font-700 uppercase tracking-wider text-lg md:text-xl">
            JM <span className="text-brick-500">Barber</span>
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className="px-3 py-2 text-sm uppercase tracking-wide font-medium text-white/80 hover:text-brick-400 transition-colors relative group"
            >
              {t(n.key)}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brick-500 transition-all group-hover:w-3/4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center bg-ink-700/80 border border-ink-400/60 rounded-full p-0.5">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                  lang === l.code
                    ? 'bg-brick-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <button
            onClick={onAdmin}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full border border-ink-400/60 text-white/60 hover:text-brick-400 hover:border-brick-500/50 transition-colors"
            aria-label={t('nav.admin')}
            title={t('nav.admin')}
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            onClick={onBook}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-all hover:shadow-[0_0_20px_rgba(138,90,59,0.4)]"
          >
            <Calendar className="w-4 h-4" />
            {t('nav.book')}
          </button>

          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 text-white"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden bg-ink-900/98 backdrop-blur-md border-t border-ink-500/40">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="text-left px-3 py-3 text-sm uppercase tracking-wide font-medium text-white/85 hover:text-brick-400 hover:bg-ink-700/60 rounded-md transition-colors"
              >
                {t(n.key)}
              </button>
            ))}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center bg-ink-700/80 border border-ink-400/60 rounded-full p-0.5">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                      lang === l.code ? 'bg-brick-500 text-white' : 'text-white/70'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onAdmin();
                }}
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-brick-400"
              >
                <Lock className="w-4 h-4" /> {t('nav.admin')}
              </button>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onBook();
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-all"
            >
              <Calendar className="w-4 h-4" />
              {t('nav.book')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
