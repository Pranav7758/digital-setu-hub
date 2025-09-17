import React, { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export default function QRCode({ data, size = 128, className = '' }: QRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true);
        const url = await QRCodeLib.toDataURL(data, {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      generateQRCode();
    }
  }, [data, size]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-white rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <img 
      src={qrCodeUrl} 
      alt="QR Code"
      className={`rounded ${className}`}
      style={{ width: size, height: size }}
    />
  );
}