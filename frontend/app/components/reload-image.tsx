import React, { useEffect, useState } from 'react';
import { LoadingImage } from './loading-image';

interface ReloadableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
}

export const ReloadableImage: React.FC<ReloadableImageProps> = ({ src, alt, width, height, ...props }) => {
  const [imageUrl, setImageUrl] = useState<string>(src);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleError = () => {
    if (errorCount < 1) {
      setErrorCount(errorCount + 1);
      // Adding a timestamp query parameter to the URL to force a reload, bypassing any caching
      setImageUrl(`${src}?ts=${new Date().getTime()}`);
    } else {
      console.error('Failed to load the image after retrying.');
    }
  };


  useEffect(() => {
    const img = new Image();
  
    img.onload = () => {
      setIsLoading(false);
    };
  
    img.onerror = () => {
      setIsLoading(false);
      // You can call your handleError function here too.
      handleError();
    };
  
    img.src = imageUrl;
  
    // This will force the onLoad event to trigger even if the image is cached.
    if (img.complete) img.onload(null as any);
  }, [imageUrl, handleError]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <><LoadingImage />{imageUrl}</>}
      <img
        src={imageUrl}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        width={width}
        height={height}
        style={{ display: isLoading ? 'none' : 'inline' }}
        {...props}
      />
    </>
  );
};