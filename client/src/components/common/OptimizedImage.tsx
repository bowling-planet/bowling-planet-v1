import React from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  className?: string;
  // Allows bypassing optimization if true
  bypassOptimization?: boolean;
}

/**
 * A drop-in replacement for standard <img> tags.
 * It automatically applies Cloudinary auto-format/quality optimization
 * and defaults to lazy loading (unless loading="eager" is passed).
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  loading = 'lazy',
  decoding = 'async',
  className = '',
  bypassOptimization = false,
  ...rest
}) => {
  // If src is empty or missing, render nothing (or fallback if preferred)
  if (!src) return null;

  const finalSrc = bypassOptimization ? src : getOptimizedImageUrl(src) || src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
      {...rest}
    />
  );
};

export default OptimizedImage;
