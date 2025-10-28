import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Clock, Eye } from 'lucide-react';
import { hubApi } from '@/lib/api';
import { useI18n } from '@/hooks/useI18n';
import Header from './Header';

interface Link {
  title: string;
  url: string;
  order: number;
}

interface Hub {
  hubName: string;
  title: string;
  description?: string;
  links: Link[];
  customName?: string;
  createdAt: string;
  clickCount: number;
}

const HubDisplay = () => {
  const { t } = useI18n();
  const { hubName } = useParams<{ hubName: string }>();
  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHub = async () => {
      if (!hubName) return;

      try {
        setLoading(true);
        const data = await hubApi.getHub(hubName);
        setHub(data);
      } catch (err) {
        console.error('Error fetching hub:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Hub not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHub();
  }, [hubName]);

  const handleLinkClick = (url: string) => {
    // Track click and redirect
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t.hub_loading}</p>
        </div>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold text-foreground">{t.hub_not_found_title}</h1>
          <p className="text-muted-foreground">
            {t.hub_not_found_description}
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="mt-4"
          >
            {t.hub_go_home}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Hub Header */}
          <div className="text-center space-y-6 mb-12">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                {hub.title}
              </h1>
              {hub.description && (
                <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  {hub.description}
                </p>
              )}
            </div>

            {/* Hub Meta */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{t.hub_created} {formatDate(hub.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{hub.clickCount} {t.hub_views}</span>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="space-y-4">
            {hub.links
              .sort((a, b) => a.order - b.order)
              .map((link, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 border-2 hover:border-primary/20"
                  onClick={() => handleLinkClick(link.url)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.url}
                        </p>
                      </div>
                      <ExternalLink
                        size={20}
                        className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-4"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              {t.hub_create_own}
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              {t.hub_branded_link}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubDisplay;