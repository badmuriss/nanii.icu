import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '../hooks/useI18n';

interface QRCodeDisplayProps {
  value: string;
  filename?: string;
}

export function QRCodeDisplay({ value, filename = 'qrcode' }: QRCodeDisplayProps) {
  const { t } = useI18n();

  const downloadQRCode = () => {
    // Get the SVG element
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (QR code size + padding)
    const size = 256;
    const padding = 40;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Draw image on canvas with padding
      ctx.drawImage(img, padding, padding, size, size);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };

  return (
    <div className="space-y-5">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {t.qrCode}
      </label>
      <div className="flex flex-col items-center gap-4">
        <div className="p-6 bg-white rounded-2xl border-2 border-border inline-block">
          <QRCodeSVG
            id="qr-code-svg"
            value={value}
            size={256}
            level="H"
          />
        </div>
        <Button
          variant="outline"
          className="w-5/6 md:w-1/2 h-12 text-base border-2 rounded-xl"
          onClick={downloadQRCode}
        >
          <Download size={18} className="mr-2" />
          {t.downloadQR}
        </Button>
      </div>
    </div>
  );
}
