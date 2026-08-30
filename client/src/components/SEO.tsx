import { type FC } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaMarkup?: Record<string, any> | Record<string, any>[];
}

const SEO: FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://res.cloudinary.com/dzs0nvuqx/image/upload/v1731666687/bowling-planet-og_xzyxyz.jpg', // Placeholder default OG image
  schemaMarkup,
}) => {
  const fullTitle = `${title} | Bowling Planet`;
  const currentUrl = canonicalUrl || typeof window !== 'undefined' ? window.location.href : 'https://bowlingplanet.co.in';

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org Markup (JSON-LD) */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
