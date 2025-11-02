import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ExternalLink } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSet: (token: string) => void;
}

const MapboxTokenInput = ({ onTokenSet }: MapboxTokenInputProps) => {
  const [token, setToken] = useState('');
  const [savedToken, setSavedToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mapbox_token');
    if (stored) {
      setSavedToken(stored);
      onTokenSet(stored);
    }
  }, [onTokenSet]);

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem('mapbox_token', token.trim());
      setSavedToken(token.trim());
      onTokenSet(token.trim());
    }
  };

  if (savedToken) {
    return (
      <Alert className="mb-4">
        <AlertDescription className="flex items-center justify-between">
          <span>Mapbox token configured ✓</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem('mapbox_token');
              setSavedToken(null);
            }}
          >
            Remove
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Mapbox Token Required</span>
        </CardTitle>
        <CardDescription>
          To use maps, you need a free Mapbox public token.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Go to{' '}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              mapbox.com/access-tokens
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            2. Create a free account or sign in
          </p>
          <p className="text-sm text-muted-foreground">
            3. Copy your "Default public token"
          </p>
          <p className="text-sm text-muted-foreground">
            4. Paste it below:
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="pk.eyJ..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={handleSave} disabled={!token.trim()}>
            Save
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Your token will be stored locally in your browser
        </p>
      </CardContent>
    </Card>
  );
};

export default MapboxTokenInput;
