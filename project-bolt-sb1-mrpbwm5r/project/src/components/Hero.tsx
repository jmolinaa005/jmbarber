import { Calendar, Scissors, ChevronRight } from 'lucide-react';
import { useLang } from '@/LanguageContext';

type Props = { onBook: () => void };

export default function Hero({ onBook }: Props) {
  const { t } = useLang();
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/WhatsApp_Image_2026-10-19_at_11.47.07.jpeg"
          alt="Barbershop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-ink-900/30" />
        <div className="absolute inset-0 bg-brick-texture opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 border border-brick-500/40 bg-brick-500/10 rounded-full animate-fade-up">
            <Scissors className="w-4 h-4 text-brick-400" />
            <span className="text-xs uppercase tracking-widest font-display font-500 text-brick-400">
              JM Barber · Blanes & Barcelona
            </span>
          </div>

          <h1 className="font-display font-700 uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight animate-fade-up">
            {t('hero.tagline').split('.').map((part, i) => (
              <span key={i} className="block">
                {part.trim() && (
                  <>
                    {part.trim()}
                    {i < 2 && <span className="text-brick-500">.</span>}
                  </>
                )}
              </span>
            ))}
          </h1>

          <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed max-w-xl animate-fade-up">
            {t('hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up">
            <button
              onClick={onBook}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-all hover:shadow-[0_0_28px_rgba(138,90,59,0.45)] hover:scale-[1.02]"
            >
              <Calendar className="w-5 h-5" />
              {t('hero.ctaBook')}
            </button>
            <button
              onClick={() => scrollTo('services')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent border border-ink-400/70 hover:border-brick-500 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-all group"
            >
              {t('hero.ctaServices')}
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-ink-900 to-transparent pointer-events-none" />
    </section>
  );
}
