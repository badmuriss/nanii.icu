import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

const RedirectHandler = () => {
  const { shortName } = useParams<{ shortName: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortName) {
        navigate('/');
        return;
      }

      try {
        // Try to fetch the URL from the backend
        const response = await fetch(`${API_BASE_URL}/${shortName}`, {
          redirect: 'manual', // Don't follow redirects automatically
        });

        if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 301) {
          // Backend returned a redirect, get the location header
          const location = response.headers.get('Location');
          if (location) {
            window.location.href = location;
            return;
          }
        }

        // If response is OK but not a redirect, try to get the location from response
        if (response.ok) {
          const location = response.headers.get('Location');
          if (location) {
            window.location.href = location;
            return;
          }
        }

        // URL not found, redirect to 404
        if (response.status === 404) {
          navigate('/404/not-found');
          return;
        }

        // Some other error
        setError('Failed to redirect');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        console.error('Redirect error:', err);
        setError('Failed to redirect');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleRedirect();
  }, [shortName, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-lg text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default RedirectHandler;
