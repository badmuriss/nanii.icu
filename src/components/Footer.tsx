import { useI18n } from '@/hooks/useI18n';
import { Github } from 'lucide-react';

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github size={20} />
        </a>
        <p className="text-muted-foreground text-sm text-center">
          {t.footer_text}
        </p>
      </div>
    </footer>
  );
};

export default Footer;