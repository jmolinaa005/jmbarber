import { useState } from 'react';
import { LanguageProvider } from '@/LanguageContext';
import { DataProvider } from '@/DataContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import AtHome from '@/components/AtHome';
import Gallery from '@/components/Gallery';
import Location from '@/components/Location';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import AdminPanel from '@/components/AdminPanel';

function Shell() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState<string | undefined>(undefined);
  const [adminOpen, setAdminOpen] = useState(false);

  const openBooking = (service?: string) => {
    setBookingService(service);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-ink-900 text-white">
      <Navbar onBook={() => openBooking()} onAdmin={() => setAdminOpen(true)} />
      <main>
        <Hero onBook={() => openBooking()} />
        <Services onBook={(s) => openBooking(s)} />
        <About />
        <AtHome onBook={(s) => openBooking(s)} />
        <Gallery />
        <Location />
        <Contact />
      </main>
      <Footer />
      <BookingModal
        open={bookingOpen}
        initialService={bookingService}
        onClose={() => setBookingOpen(false)}
      />
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <Shell />
      </DataProvider>
    </LanguageProvider>
  );
}
