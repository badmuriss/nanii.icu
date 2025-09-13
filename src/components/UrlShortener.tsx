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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Main Input Section */}
      <Card className="p-6 sm:p-8 bg-card border-border shadow-md">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="url"
                placeholder={t.placeholder}
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-12 h-14 text-lg border-input-border bg-input focus:ring-2 focus:ring-ring"
              />
              <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            </div>
            
            <Input
              type="text"
              placeholder={t.custom_placeholder}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-12 border-input-border bg-input focus:ring-2 focus:ring-ring"
            />
            
            <Button 
              onClick={handleShorten}
              disabled={isLoading || !originalUrl.trim()}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary-hover text-primary-foreground shadow-nani transition-normal"
            >
              {isLoading ? 'Encurtando...' : t.button_shorten}
            </Button>
          </div>
        </div>
      </Card>

      {/* Result Section */}
      {result && (
        <Card className="p-6 sm:p-8 bg-card border-border shadow-md animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                ✨ Link encurtado com sucesso!
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t.result_original}
                </label>
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground break-all">
                  {result.originalUrl}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t.result_shortened}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-accent rounded-lg text-foreground font-medium break-all">
                    {result.shortUrl}
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="px-4 transition-fast"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UrlShortener;