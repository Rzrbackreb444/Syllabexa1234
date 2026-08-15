import React, { useEffect, useRef } from 'react';
import bwipjs from 'bwip-js/browser';

interface EanBarcodeGeneratorProps {
  isbn: string;
  price: string;
  className?: string;
  scale?: number;
}

export default function EanBarcodeGenerator({ isbn, price, className = '', scale = 3 }: EanBarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        let cleanIsbn = (isbn || '9780000000000').replace(/[^0-9]/g, '');
        // Extract only the first 12 digits so bwip-js automatically calculates and appends the valid 13th check digit.
        cleanIsbn = cleanIsbn.substring(0, 12);
        if (cleanIsbn.length < 12) {
             cleanIsbn = cleanIsbn.padEnd(12, '0');
        }

        let extension = '';
        if (price) {
           const numericPrice = price.replace(/[^0-9.]/g, '');
           const priceParts = numericPrice.split('.');
           let dollars = priceParts[0] || '0';
           let cents = priceParts[1] ? priceParts[1].substring(0,2).padEnd(2, '0') : '00';
           let priceStr = dollars + cents;
           if (priceStr.length > 4) {
             priceStr = priceStr.substring(0, 4);
           }
           extension = '5' + priceStr.padStart(4, '0');
        }

        bwipjs.toCanvas(canvasRef.current, {
          bcid: 'ean13',
          text: cleanIsbn,
          addontext: extension || undefined,
          scale: scale,
          height: 15,
          includetext: true,
          textxalign: 'center',
          backgroundcolor: 'ffffff'
        } as any);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isbn, price, scale]);

  return <canvas ref={canvasRef} className={className} />;
}
