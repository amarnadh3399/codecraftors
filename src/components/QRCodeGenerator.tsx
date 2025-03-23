import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator = ({
  value,
  size = 200,
  className = "",
}: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!value) {
      setQrCodeUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrCodeUrl(dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
        setQrCodeUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [value, size]);

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${value.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
        style={{ width: size, height: size }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-muted-foreground">Failed to generate QR code</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={qrCodeUrl}
        alt={`QR Code for ${value}`}
        className={`rounded-md ${className}`}
        width={size}
        height={size}
        onLoad={() => setIsLoading(false)}
      />
      <Button variant="outline" size="sm" onClick={downloadQRCode}>
        <Download className="h-4 w-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  );
};
