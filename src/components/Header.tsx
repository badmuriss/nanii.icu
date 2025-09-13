import naniLogo from '@/assets/nani-logo.png';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={naniLogo} 
            alt="Nani.icu" 
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-nani">
            nani.icu
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;