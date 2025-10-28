import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { AvailabilityState } from '@/hooks/useAvailability';

interface CustomNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder: string;
  availability: AvailabilityState;
  availableMessage: string;
}

export const CustomNameInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  availability,
  availableMessage,
}: CustomNameInputProps) => {
  return (
    <div>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className={`h-14 border-2 bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-2xl pr-10 ${
            availability.available === true
              ? 'border-green-500 focus:border-green-500'
              : availability.available === false
              ? 'border-red-500 focus:border-red-500'
              : 'border-border focus:border-primary'
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {availability.checking ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : availability.available === true ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : availability.available === false ? (
            <XCircle className="w-4 h-4 text-red-500" />
          ) : null}
        </div>
      </div>
      <div className="h-6 mt-2 px-3">
        {availability.available === false && availability.reason && (
          <p className="text-sm text-red-500">{availability.reason}</p>
        )}
        {availability.available === true && (
          <p className="text-sm text-green-500">{availableMessage}</p>
        )}
      </div>
    </div>
  );
};
