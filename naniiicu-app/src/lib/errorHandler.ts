import { Translations } from './i18n';

interface ErrorHandler {
  message: string;
  variant: 'default' | 'destructive';
}

export const handleApiError = (error: unknown, t: Translations): ErrorHandler => {
  if (error instanceof Error) {
    if (error.message.includes('already taken') || error.message.includes('reserved')) {
      return {
        message: t.error_name_taken,
        variant: 'destructive',
      };
    }

    if (error.message.includes('Invalid URL')) {
      return {
        message: t.error_invalid_url,
        variant: 'destructive',
      };
    }
  }

  return {
    message: t.error_generic,
    variant: 'destructive',
  };
};
