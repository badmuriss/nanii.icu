import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Copy, Check, Link2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useToast } from '@/hooks/use-toast';

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  customName?: string;
}

const UrlShortener = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [copied, setCopied] = useState(false);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    if (!originalUrl.trim()) return;
    
    if (!validateUrl(originalUrl)) {
      toast({
        variant: "destructive",
        title: t.error_invalid_url,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          customName: customName.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          originalUrl,
          shortUrl: `${window.location.origin}/${data.shortName}`,
          customName: customName.trim() || undefined,
        });
        
        // Clear inputs after success
        setOriginalUrl('');
        setCustomName('');
      } else if (response.status === 400) {
        toast({
          variant: "destructive",
          title: t.error_invalid_url,
        });
      } else if (response.status === 409) {
        toast({
          variant: "destructive", 
          title: t.error_name_taken,
        });
      } else {
        toast({
          variant: "destructive",
          title: t.error_generic,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.error_generic,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.shortUrl) return;
    
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      toast({
        title: t.copy_success,
        variant: "default",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = result.shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast({
        title: t.copy_success,
        variant: "default",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleShorten();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12">
      {/* Main Input Section */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            {t.subtitle}
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <Input
              type="url"
              placeholder={t.placeholder}
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-12 h-16 text-lg border-2 border-border bg-background focus:border-primary focus:ring-0 transition-colors"
            />
            <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          </div>
          
          <Input
            type="text"
            placeholder={t.custom_placeholder}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-14 border-2 border-border bg-background focus:border-primary focus:ring-0 transition-colors"
          />
          
          <Button 
            onClick={handleShorten}
            disabled={isLoading || !originalUrl.trim()}
            className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary-hover text-primary-foreground shadow-nani transition-all hover:shadow-lg hover:scale-[1.02]"
          >
            {isLoading ? 'Encurtando...' : t.button_shorten}
          </Button>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              ✨ Link encurtado com sucesso!
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {t.result_original}
              </label>
              <div className="p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground break-all border border-border">
                {result.originalUrl}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {t.result_shortened}
              </label>
              <div className="flex gap-3">
                <div className="flex-1 p-4 bg-primary/5 border-2 border-primary/20 rounded-xl text-foreground font-medium break-all">
                  {result.shortUrl}
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="px-6 h-auto py-4 border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;