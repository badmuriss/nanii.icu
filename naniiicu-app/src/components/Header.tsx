import naniLogo from '/nani-logo.png';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* <img 
            src={naniLogo} 
            alt="nanii.icu" 
            className="w-9 h-9 mt-1 mr-2"
          /> */}
          <a href="/">
            <h1 className="text-2xl md:text-3xl mt-1 font-title text-gradient-nani tracking-tight">
              nanii.icu
            </h1>
          </a>
        </div>
        
        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;