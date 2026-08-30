import { type FC } from 'react'
import SEO from '../../components/SEO'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import ItemParentLink from './components/ItemParentLink'
import ItemHeader from './components/ItemHeader'
import ItemGallery from './components/ItemGallery'
import ItemFeatureList from './components/ItemFeatureList'
import ItemPoints from './components/ItemPoints'
import ItemUsedIn from './components/ItemUsedIn'
import ItemPurchaseCTA from './components/ItemPurchaseCTA'
import {
  getProductItemBySlug,
} from './services/productItemDetailsApi'

const ProductItemDetailsPage: FC = () => {
  const { itemSlug } = useParams<{ baseSlug: string; itemSlug: string }>()
  const resolvedSlug = itemSlug

  const { data: item, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['public-product-item-details', resolvedSlug],
    queryFn: async () => {
      if (!resolvedSlug) throw new Error('Product not found.')
      return await getProductItemBySlug(resolvedSlug)
    },
    enabled: !!resolvedSlug,
    staleTime: 5 * 60 * 1000,
  })

  if (loading) {
    return (
      <div className="product-item-details-page flex min-h-[60vh] items-center justify-center bg-black px-5 pt-36">
        <Loader label="Loading product…" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="product-item-details-page flex min-h-[60vh] items-center justify-center bg-black px-5 pt-36">
        <ErrorState
          message={error ? error.message : 'Product not found.'}
          onRetry={() => void refetch()}
        />
      </div>
    )
  }

  return (
    <div className="product-item-details-page min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO
        title={`${item.title} | Products | Bowling Planet`}
        description={item.description || `Buy ${item.title} at Bowling Planet. Get top-tier arcade machines and entertainment equipment.`}
        ogImage={item.thumbnail?.url}
        schemaMarkup={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: item.title,
            description: item.description,
            image: item.thumbnail?.url,
            // Only add offers if there is a price to avoid warnings for missing price/currency
            ...(item.price && {
              offers: {
                '@type': 'Offer',
                price: item.price,
                priceCurrency: 'INR',
              },
            }),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://bowlingplanet.co.in'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: 'https://bowlingplanet.co.in/products'
              },
              ...(item.baseProduct ? [{
                '@type': 'ListItem',
                position: 3,
                name: item.baseProduct.title || 'Category',
                item: `https://bowlingplanet.co.in/products/${item.baseProduct.slug}`
              }, {
                '@type': 'ListItem',
                position: 4,
                name: item.title,
                item: `https://bowlingplanet.co.in/products/${item.baseProduct.slug}/${item.slug}`
              }] : [{
                '@type': 'ListItem',
                position: 3,
                name: item.title,
                item: `https://bowlingplanet.co.in/products/${item.slug}`
              }])
            ]
          }
        ]}
      />

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-32 sm:px-7 sm:pt-36">
        <div className="mb-5">
          <ItemParentLink baseProduct={item.baseProduct} />
        </div>

        {/* Two-column catalogue detail — core product visible first viewport */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
          {/* Left: gallery + sticky CTA */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <ItemGallery
              thumbnail={item.thumbnail}
              gallery={item.gallery}
              title={item.title}
            />
            <ItemPurchaseCTA
              hasPrice={item.price !== undefined}
              itemTitle={item.title}
              itemId={item._id || item.slug}
            />
          </div>

          {/* Right: details sections */}
          <div className="space-y-8">
            <ItemHeader
              title={item.title}
              description={item.description}
              price={item.price}
            />
            <ItemFeatureList featureList={item.featureList} />
            <ItemPoints points={item.points} />
            <ItemUsedIn usedIn={item.usedIn} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductItemDetailsPage
