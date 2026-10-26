import { MapPin, Heart, Sparkles } from 'lucide-react';
import { useLang } from '@/LanguageContext';

export default function About() {
  const { t } = useLang();

  return (
    <section id="about" className="py-20 md:py-28 bg-ink-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-brick-texture opacity-15 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden border border-ink-400/60 group">
              <img
                src="/images/uic.jpeg"
                alt="JM Barber amb el seu gos"
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -right-5 sm:-right-6 industrial-card rounded-lg px-5 py-4 border-glow">
              <p className="font-display font-700 uppercase text-2xl text-brick-500">Joan</p>
              <p className="text-xs uppercase tracking-wide text-white/60">Molina</p>
            </div>
          </div>

          <div>
            <p className="text-brick-500 font-display font-600 uppercase tracking-widest text-xs mb-3">
              {t('about.subtitle')}
            </p>
            <h2 className="font-display font-700 uppercase text-3xl md:text-5xl tracking-tight mb-8">
              {t('about.title')}
            </h2>

            <div className="space-y-5 text-white/75 leading-relaxed">
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <p className="font-display font-500 text-brick-400 text-lg uppercase tracking-wide">
                {t('about.p3')}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Heart, label: t('about.badgeClose') },
                { icon: Sparkles, label: t('about.badgeStyle') },
                { icon: MapPin, label: t('about.badgeBlanes') },
                { icon: MapPin, label: t('about.badgeBcn') },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.label}
                    className="industrial-card rounded-lg p-4 text-center border-glow"
                  >
                    <Icon className="w-5 h-5 text-brick-500 mx-auto mb-2" />
                    <p className="text-xs uppercase tracking-wide text-white/70">{b.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
