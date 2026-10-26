import { Scissors, Home, Check, Gift } from 'lucide-react';
import { useLang } from '@/LanguageContext';
import { SERVICE_CORTE, SERVICE_DOMICILIO } from '@/lib/supabase';

type Props = { onBook: (service?: string) => void };

export default function Services({ onBook }: Props) {
  const { t, lang } = useLang();

  const services = [
    {
      key: SERVICE_CORTE,
      title: t('services.haircut'),
      desc: t('services.haircutDesc'),
      price: 7,
      icon: Scissors,
      features: [t('services.featureHair'), t('services.featureBeard'), t('services.featureBrows')],
    },
    {
      key: SERVICE_DOMICILIO,
      title: t('services.home'),
      desc: t('services.homeDesc'),
      price: 11,
      icon: Home,
      features: [t('services.featureHomeService'), t('services.featureCoverage'), t('services.featureMaterials')],
    },
  ];

  return (
    <section id="services" className="py-20 md:py-28 relative bg-ink-900">
      <div className="absolute inset-0 bg-brick-texture opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brick-500 font-display font-600 uppercase tracking-widest text-xs mb-3">
            JM Barber
          </p>
          <h2 className="font-display font-700 uppercase text-3xl md:text-5xl tracking-tight">
            {t('services.title')}
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">{t('services.subtitle')}</p>
          <div className="mt-6 w-16 h-0.5 bg-brick-500 mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="industrial-card rounded-xl p-7 md:p-8 transition-all hover:-translate-y-1 border-glow group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-lg bg-brick-500/15 border border-brick-500/30 flex items-center justify-center group-hover:bg-brick-500/25 transition-colors">
                    <Icon className="w-7 h-7 text-brick-400" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wide text-white/50">
                      {t('services.from')}
                    </span>
                    <div className="font-display font-700 text-3xl text-white">
                      {s.price}€
                    </div>
                  </div>
                </div>

                <h3 className="font-display font-600 uppercase text-xl tracking-wide mb-1">
                  {s.title}
                </h3>
                <p className="text-white/60 text-sm mb-5">{s.desc}</p>

                <ul className="space-y-2 mb-6">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4 text-brick-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onBook(s.key)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink-700 hover:bg-brick-500 border border-ink-400/60 hover:border-brick-500 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-all"
                >
                  {t('services.book')}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {[t('services.promotionReferral'), t('services.promotionLoyalty'), t('services.promotionBirthday')].map((promotion) => (
            <div key={promotion} className="rounded-xl border border-brick-500/30 bg-brick-500/10 p-5 flex items-start gap-3">
              <Gift className="w-5 h-5 text-brick-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display font-600 uppercase text-sm tracking-wide text-brick-300">
                  {t('services.promotionsTitle')}
                </h3>
                <p className="text-white/75 text-sm mt-1">{promotion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
