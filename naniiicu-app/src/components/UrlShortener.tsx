import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Link2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useToast } from '@/hooks/use-toast';
import { urlApi, hubApi } from '@/lib/api';
import { useAvailability } from '@/hooks/useAvailability';
import { CustomNameInput } from '@/components/CustomNameInput';
import { handleApiError } from '@/lib/errorHandler';

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  customName?: string;
}

interface Link {
  title: string;
  url: string;
  order: number;
}

interface CreatedHub {
  hubName: string;
  title: string;
  description?: string;
  links: Link[];
  customName?: string;
  hubUrl: string;
}

type Mode = 'url' | 'hub';
type Result = ShortenedUrl | CreatedHub;

const UrlShortener = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>('url');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  // URL mode state
  const [originalUrl, setOriginalUrl] = useState('');
  const [customName, setCustomName] = useState('');

  // Hub mode state
  const [hubTitle, setHubTitle] = useState('');
  const [hubDescription, setHubDescription] = useState('');
  const [hubCustomName, setHubCustomName] = useState('');
  const [hubLinks, setHubLinks] = useState<Link[]>([{ title: '', url: '', order: 0 }]);

  // Availability checking with custom hook
  const checkUrlAvailability = useCallback(
    async (name: string) => urlApi.checkAvailability({ customName: name }),
    []
  );

  const checkHubAvailability = useCallback(
    async (name: string) => hubApi.checkHubAvailability({ customName: name }),
    []
  );

  const customNameAvailability = useAvailability(customName, {
    checkFn: checkUrlAvailability,
  });

  const hubNameAvailability = useAvailability(hubCustomName, {
    checkFn: checkHubAvailability,
  });

  const formatUrl = (url: string): string => {
    if (!url.trim()) return url;

    // If already has protocol, keep it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Add https:// by default
    return `https://${url}`;
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Hub link management
  const addHubLink = () => {
    if (hubLinks.length < 10) {
      setHubLinks([...hubLinks, { title: '', url: '', order: hubLinks.length }]);
    }
  };

  const removeHubLink = (index: number) => {
    if (hubLinks.length > 1) {
      setHubLinks(hubLinks.filter((_, i) => i !== index).map((link, i) => ({ ...link, order: i })));
    }
  };

  const updateHubLink = (index: number, field: keyof Link, value: string) => {
    const updatedLinks = hubLinks.map((link, i) =>
      i === index ? { ...link, [field]: field === 'order' ? parseInt(value) || 0 : value } : link
    );
    setHubLinks(updatedLinks);
  };

  // URL shortening
  const handleShorten = async () => {
    if (!originalUrl.trim()) return;

    const formattedUrl = formatUrl(originalUrl.trim());

    if (!validateUrl(formattedUrl)) {
      toast({
        variant: "destructive",
        title: t.error_invalid_url,
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await urlApi.createShortUrl({
        originalUrl: formattedUrl,
        customName: customName.trim() || undefined,
      });

      setResult({
        originalUrl: formattedUrl,
        shortUrl: `${window.location.origin}/${data.shortName}`,
        customName: customName.trim() || undefined,
      } as ShortenedUrl);

      // Clear inputs after success
      setOriginalUrl('');
      setCustomName('');
    } catch (error) {
      console.error('Error creating short URL:', error);
      const errorInfo = handleApiError(error, t);
      toast({
        variant: errorInfo.variant,
        title: errorInfo.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hub creation
  const handleCreateHub = async () => {
    if (!hubTitle.trim()) {
      toast({
        variant: "destructive",
        title: t.hub_title_required,
      });
      return;
    }

    // Validate all links
    const validLinks = hubLinks.filter(link => link.title.trim() && link.url.trim());
    if (validLinks.length === 0) {
      toast({
        variant: "destructive",
        title: t.hub_one_link_required,
      });
      return;
    }

    // Validate URLs
    for (const link of validLinks) {
      const formattedUrl = formatUrl(link.url.trim());
      if (!validateUrl(formattedUrl)) {
        toast({
          variant: "destructive",
          title: `${t.hub_invalid_url_in_link}: ${link.title}`,
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const formattedLinks = validLinks.map((link, index) => ({
        title: link.title.trim(),
        url: formatUrl(link.url.trim()),
        order: index,
      }));

      const data = await hubApi.createHub({
        title: hubTitle.trim(),
        description: hubDescription.trim() || undefined,
        links: formattedLinks,
        customName: hubCustomName.trim() || undefined,
      });

      setResult({
        hubName: data.hubName,
        title: data.title,
        description: data.description,
        links: data.links,
        customName: data.customName,
        hubUrl: `${window.location.origin}/${data.hubName}`,
      } as CreatedHub);

      // Clear inputs after success
      setHubTitle('');
      setHubDescription('');
      setHubCustomName('');
      setHubLinks([{ title: '', url: '', order: 0 }]);
    } catch (error) {
      console.error('Error creating hub:', error);
      const errorInfo = handleApiError(error, t);
      toast({
        variant: errorInfo.variant,
        title: errorInfo.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    const textToCopy = 'shortUrl' in result ? result.shortUrl : result.hubUrl;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: t.copy_success,
        variant: "default",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
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

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !isLoading) {
      action();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 pb-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-title text-foreground tracking-wide">
          {t.title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Mode Tabs */}
      <Tabs className="max-w-2xl mx-auto" value={mode} onValueChange={(value) => { setMode(value as Mode); setResult(null); }}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="url">{t.mode_single_url}</TabsTrigger>
          <TabsTrigger value="hub">{t.mode_link_hub}</TabsTrigger>
        </TabsList>

        {/* URL Mode */}
        <TabsContent value="url" className="space-y-6">
          <div className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              placeholder={t.placeholder}
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, handleShorten)}
              className="pl-12 h-16 text-lg border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-2xl"
            />
            <Link2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          </div>
          
          <CustomNameInput
            value={customName}
            onChange={setCustomName}
            onKeyDown={(e) => handleKeyPress(e, handleShorten)}
            placeholder={t.custom_placeholder}
            availability={customNameAvailability}
            availableMessage={t.custom_name_available}
          />
          
          <Button
            onClick={handleShorten}
            disabled={isLoading || !originalUrl.trim()}
            className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:shadow-lg hover:scale-[1.02] rounded-2xl disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.shortening}
              </div>
            ) : (
              t.button_shorten
            )}
          </Button>
          </div>
        </TabsContent>

        {/* Hub Mode */}
        <TabsContent value="hub" className="space-y-6">
          <Input
            type="text"
            placeholder={t.hub_title_placeholder}
            value={hubTitle}
            onChange={(e) => setHubTitle(e.target.value)}
            className="h-14 text-lg border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-2xl"
          />

          <Textarea
            placeholder={t.hub_description_placeholder}
            value={hubDescription}
            onChange={(e) => setHubDescription(e.target.value)}
            className="border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-2xl resize-none"
            rows={3}
          />

          <CustomNameInput
            value={hubCustomName}
            onChange={setHubCustomName}
            placeholder={t.hub_custom_name_placeholder}
            availability={hubNameAvailability}
            availableMessage={t.hub_name_available}
          />

          {/* Links Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-highlight">{t.hub_links_section}</h3>
              <Button
                onClick={addHubLink}
                disabled={hubLinks.length >= 10}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                {t.hub_add_link}
              </Button>
            </div>

            {hubLinks.map((link, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    type="text"
                    placeholder={t.hub_link_title_placeholder}
                    value={link.title}
                    onChange={(e) => updateHubLink(index, 'title', e.target.value)}
                    className="h-12 border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
                  />
                  <Input
                    type="text"
                    placeholder={t.hub_link_url_placeholder}
                    value={link.url}
                    onChange={(e) => updateHubLink(index, 'url', e.target.value)}
                    className="h-12 border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl"
                  />
                </div>
                {hubLinks.length > 1 && (
                  <Button
                    onClick={() => removeHubLink(index)}
                    variant="outline"
                    size="sm"
                    className="mt-2 p-2 h-8 w-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleCreateHub}
            disabled={isLoading || !hubTitle.trim()}
            className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:shadow-lg hover:scale-[1.02] rounded-2xl disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.hub_creating}
              </div>
            ) : (
              t.hub_create_button
            )}
          </Button>
        </TabsContent>
      </Tabs>

      {/* Result Section */}
      {result && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h3 className="text-3xl font-highlight text-foreground mb-2">
              ✨ {'shortUrl' in result ? t.url_success_title : t.hub_success_title}
            </h3>
          </div>

          <div className="space-y-6">
            {'shortUrl' in result ? (
              // URL Result
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {t.result_original}
                  </label>
                  <div className="p-4 bg-muted/50 rounded-2xl text-sm text-muted-foreground break-all border border-border">
                    {result.originalUrl}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {t.result_shortened}
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl text-foreground font-medium break-all font-mono">
                      {result.shortUrl}
                    </div>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="px-6 h-auto py-4 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              // Hub Result
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {t.hub_success_details}
                  </label>
                  <div className="p-4 bg-muted/50 rounded-2xl border border-border space-y-2">
                    <div className="text-lg font-semibold">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-muted-foreground">{result.description}</div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {result.links.length} {result.links.length === 1 ? t.link_singular : t.links_plural}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {t.hub_success_url}
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl text-foreground font-medium break-all font-mono">
                      {result.hubUrl}
                    </div>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      size="sm"
                      className="px-6 h-auto py-4 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 rounded-xl"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;