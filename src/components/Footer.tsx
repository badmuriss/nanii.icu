import { useI18n } from '@/hooks/useI18n';

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-muted-foreground text-sm">
          {t.footer_text}
        </p>
      </div>
    </footer>
  );
};

export default Footer;