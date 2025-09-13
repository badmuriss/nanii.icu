import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useI18n();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="text-8xl font-bold text-gradient-nani mb-4">
            404
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Oops! Link não encontrado
          </h1>
          <p className="text-muted-foreground">
            Este link 'nanico' não existe ou foi removido.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-nani"
          >
            Voltar ao início
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
