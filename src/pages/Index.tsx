import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UrlShortener from '@/components/UrlShortener';

const Index = () => {
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
