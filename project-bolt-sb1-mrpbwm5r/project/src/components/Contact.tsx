import { Phone, Instagram, Info, Clock } from 'lucide-react';
import { useLang } from '@/LanguageContext';

const PHONE = '+346767592 46';
const PHONE_DISPLAY = '+34 676 75 92 46';
const INSTA = 'jm.barber.24';
const WHATSAPP_URL = `https://wa.me/${PHONE.replace(/\s/g, '')}`;
const INSTA_URL = `https://instagram.com/${INSTA}`;

export default function Contact() {
  const { t } = useLang();

  return (
    <section id="contact" className="py-20 md:py-28 bg-ink-800 relative">
      <div className="absolute inset-0 bg-brick-texture opacity-15 pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-brick-500 font-display font-600 uppercase tracking-widest text-xs mb-3">
            {t('contact.subtitle')}
          </p>
          <h2 className="font-display font-700 uppercase text-3xl md:text-5xl tracking-tight">
            {t('contact.title')}
          </h2>
          <div className="mt-4 w-16 h-0.5 bg-brick-500 mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="industrial-card rounded-xl p-6 border-glow group flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-lg bg-brick-500/15 border border-brick-500/30 flex items-center justify-center mb-4 group-hover:bg-brick-500/25 transition-colors">
              <Phone className="w-6 h-6 text-brick-400" />
            </div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
              {t('contact.phoneLabel')}
            </p>
            <p className="font-display font-600 text-lg text-white">{PHONE_DISPLAY}</p>
            <p className="text-xs text-white/40 mt-2">{t('contact.phoneNote')}</p>
          </a>

          <a
            href={INSTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="industrial-card rounded-xl p-6 border-glow group flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-lg bg-brick-500/15 border border-brick-500/30 flex items-center justify-center mb-4 group-hover:bg-brick-500/25 transition-colors">
              <Instagram className="w-6 h-6 text-brick-400" />
            </div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
              {t('contact.instaLabel')}
            </p>
            <p className="font-display font-600 text-lg text-white">@{INSTA}</p>
            <p className="text-xs text-white/40 mt-2">jm.barber.24</p>
          </a>

          <div className="industrial-card rounded-xl p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-lg bg-brick-500/15 border border-brick-500/30 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-brick-400" />
            </div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">{t('contact.hours')}</p>
            <p className="font-display font-600 text-sm text-white">{t('contact.hoursValue')}</p>
          </div>
        </div>

        <div className="mt-8 industrial-card rounded-xl p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-brick-500 shrink-0 mt-0.5" />
          <p className="text-sm text-white/70">
            {t('contact.phoneNote')}
          </p>
        </div>
      </div>
    </section>
  );
}
