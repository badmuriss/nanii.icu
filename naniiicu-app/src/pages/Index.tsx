import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UrlShortener from '@/components/UrlShortener';
import { useI18n } from '@/hooks/useI18n';

const Index = () => {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `nanii.icu - ${t.page_title_shortener}`;
  }, [t.page_title_shortener]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <UrlShortener />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
