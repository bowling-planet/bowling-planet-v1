import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/SEO'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import ProductItemsGrid from './components/ProductItemsGrid'
import ProductItemsSort, { type ProductItemsSortOption } from './components/ProductItemsSort'
import {
  getBaseProductWithItems,
  type BaseProductWithItems,
  type IProductItem,
} from './services/baseProductDetailsApi'
import { Plus, Check, Package } from 'lucide-react'
import { useLeadTracker } from '../../context/LeadTrackerContext'

function sortItems(items: IProductItem[], sort: ProductItemsSortOption): IProductItem[] {
  const next = [...items]
  switch (sort) {
    case 'newest':
      return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'bestsellers':
      return next.sort((a, b) => b.purchaseCount - a.purchaseCount)
    case 'featured':
      return next.sort((a, b) => {
        if (b.featuredOrder !== a.featuredOrder) return b.featuredOrder - a.featuredOrder
        return b.purchaseCount - a.purchaseCount
      })
    case 'price-asc':
      return next.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY))
    case 'price-desc':
      return next.sort((a, b) => (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY))
    default:
      return next
  }
}

const BaseProductDetailsPage: FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<BaseProductWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<ProductItemsSortOption>('featured')
  const [activePill, setActivePill] = useState<string | null>(null)
  const { state, addToEnquiry } = useLeadTracker()

  const load = useCallback(async () => {
    if (!slug) {
      setError('Product category not found.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await getBaseProductWithItems(slug)
      setData(result)
    } catch {
      setError('Unable to load this product category.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  const sortedItems = useMemo(() => (data ? sortItems(data.items, sort) : []), [data, sort])

  const visibleItems = useMemo(() => {
    if (!activePill) return sortedItems
    return sortedItems.filter((item) => item.slug === activePill)
  }, [sortedItems, activePill])

  if (loading) {
    return (
      <div className="base-product-details-page flex min-h-[60vh] items-center justify-center bg-black px-5 pt-28">
        <Loader label="Loading category…" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="base-product-details-page flex min-h-[60vh] items-center justify-center bg-black px-5 pt-28">
        <ErrorState message={error ?? 'Product category not found.'} onRetry={() => void load()} />
      </div>
    )
  }

  const categoryId = data._id || data.slug
  const isAdded = state.enquiryCart.some((i) => i.id === categoryId)

  return (
    <div className="base-product-details-page min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO
        title={`${data.title} | Products | Bowling Planet`}
        description={data.description || `Browse world-class ${data.title} equipment and arcade variants at Bowling Planet.`}
        ogImage={data.thumbnail?.url}
      />

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-24 sm:px-7 sm:pt-28">
        {/* Compact category bar — category thumbnail as backdrop */}
        {/* Added min-h-[280px] sm:min-h-[340px] and flex items-end to position the text neatly at the bottom */}
        <div className="relative mb-5 min-h-[240px] sm:min-h-[340px] flex items-end overflow-hidden rounded-2xl border border-[#5FC1D1]/20 p-4 sm:p-6">
          {data.thumbnail?.url ? (
            <div className="absolute inset-0">
              <img
                src={data.thumbnail.url}
                alt=""
                aria-hidden
                className="h-full w-full object-cover object-center"
              />
              {/* Tweaked gradient slightly to make sure text remains readable on taller images */}
              <div
                className="absolute inset-0 backdrop-blur-sm"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.95) 80%), radial-gradient(ellipse 70% 80% at 15% 50%, rgba(95,193,209,0.15), transparent 55%)',
                }}
              />
            </div>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 140% at 0% 0%, rgba(95,193,209,0.22) 0%, rgba(95,193,209,0.08) 38%, rgba(109,189,78,0.05) 62%, transparent 100%), linear-gradient(180deg, rgba(17,17,24,0.95) 0%, rgba(10,10,15,0.4) 70%, transparent 100%)',
              }}
            />
          )}

          {/* Added w-full to make sure content spans properly when aligned to the bottom */}
          <div className="relative z-[1] flex w-full flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="min-w-0 w-full sm:flex-1">
              <Link
                to="/products"
                className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-[#A1A1A6] transition-colors hover:text-[#5FC1D1]"
              >
                ← All categories
              </Link>

              <div className="min-w-0">
                <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
                  <Package size={12} />
                  Category
                </p>
                <h1 className="font-display text-[clamp(1.35rem,2.8vw,1.85rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                  {data.title}
                </h1>
                {data.description ? (
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#A1A1A6] line-clamp-2">
                    {data.description}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Self-end keeps the button aligned nicely alongside the bottom-anchored text */}
            <button
              type="button"
              onClick={() => addToEnquiry({ id: categoryId, type: 'product', title: data.title })}
              className={`inline-flex w-full sm:w-auto justify-center sm:self-end cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition-colors ${isAdded
                  ? 'border-[#6DBD4E]/45 bg-[#6DBD4E]/10 text-[#6DBD4E]'
                  : 'border-[#5FC1D1]/45 bg-[#5FC1D1]/10 text-[#5FC1D1] hover:bg-[#5FC1D1]/20'
                }`}
            >
              {isAdded ? <Check size={15} /> : <Plus size={15} />}
              {isAdded ? 'In enquiry' : 'Enquire category'}
            </button>
          </div>
        </div>

        {/* Product pills + toolbar */}
        <div className="mb-5 space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#F5F5F7]">
                Products in this category
              </h2>
              <p className="text-sm text-[#A1A1A6]">
                {sortedItems.length} product{sortedItems.length === 1 ? '' : 's'}
              </p>
            </div>
            <ProductItemsSort value={sort} onChange={setSort} />
          </div>

          {sortedItems.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar" aria-label="Products in category">
              <button
                type="button"
                onClick={() => setActivePill(null)}
                className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${activePill === null
                    ? 'border-[#5FC1D1] bg-[#5FC1D1]/15 text-[#5FC1D1]'
                    : 'border-white/15 bg-[#111118] text-[#A1A1A6] hover:border-[#5FC1D1]/40 hover:text-[#F5F5F7]'
                  }`}
              >
                All products
              </button>
              {sortedItems.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setActivePill(item.slug)}
                  className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${activePill === item.slug
                      ? 'border-[#5FC1D1] bg-[#5FC1D1]/15 text-[#5FC1D1]'
                      : 'border-white/15 bg-[#111118] text-[#A1A1A6] hover:border-[#5FC1D1]/40 hover:text-[#F5F5F7]'
                    }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <ProductItemsGrid items={visibleItems} baseSlug={slug?slug:""} />
      </div>
    </div>
  )
}

export default BaseProductDetailsPage
