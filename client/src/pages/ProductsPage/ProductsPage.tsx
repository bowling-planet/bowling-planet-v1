import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import SEO from '../../components/SEO'
import ProductsFilters, { type ProductsFilterState } from './components/ProductsFilters'
import BaseProductGrid from './components/BaseProductGrid'
import Pagination from './components/Pagination'
import {
  getAllBaseProducts,
  type IBaseProduct,
  type IPaginationMeta,
} from './services/baseProductsApi'

const ProductsPage: FC = () => {
  const [filters, setFilters] = useState<ProductsFilterState>({ search: '' })
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState<IBaseProduct[]>([])
  const [pagination, setPagination] = useState<IPaginationMeta>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllBaseProducts({
        page,
        limit: 12,
        search: filters.search || undefined,
      })
      setProducts(data.products)
      setPagination(data.pagination)
    } catch {
      setError('Unable to load products.')
    } finally {
      setLoading(false)
    }
  }, [filters.search, page])

  useEffect(() => {
    void load()
  }, [load])

  const categories = useMemo(
    () => products.map((p) => ({ slug: p.slug, title: p.title })),
    [products],
  )

  const visibleProducts = useMemo(() => {
    if (!activeSlug) return products
    return products.filter((p) => p.slug === activeSlug)
  }, [products, activeSlug])

  const handleSelectCategory = (slug: string | null) => {
    setActiveSlug(slug)
    if (slug) {
      document.getElementById(`category-${slug}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }

  return (
    <div className="products-catalogue min-h-[60vh] bg-black text-[#F5F5F7]">
      <SEO
        title="Products & Equipment | Bowling Planet"
        description="Explore our world-class entertainment products, arcade machines, VR setups, and bowling equipment for your FEC."
      />

      {/* Hero — isolated Apple-style product render */}
      <header className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDl8jrKH8y262rBGnWZ1IVeoUA1c5HYEpJtisoKKVKr81om2DFq5OeQWA&s=10"
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-[center_35%]"
          />
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.85) 42%, rgba(0,0,0,0.98) 100%), radial-gradient(ellipse 70% 55% at 75% 35%, rgba(95,193,209,0.15), transparent 58%)',
            }}
          />
        </div>

        <div className="relative z-[1] mx-auto max-w-[1280px] px-5 pb-8 pt-24 sm:px-7 sm:pb-10 sm:pt-28">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5FC1D1]">
                Catalogue
              </p>
              <h1 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.02em] text-[#F5F5F7]">
                Product categories
              </h1>
            </div>
            {!loading && !error ? (
              <p className="text-sm text-[#A1A1A6]">
                {pagination.total} categor{pagination.total === 1 ? 'y' : 'ies'}
              </p>
            ) : null}
          </div>

          <ProductsFilters
            value={filters}
            categories={categories}
            activeSlug={activeSlug}
            onSelectCategory={handleSelectCategory}
            onChange={(next) => {
              setFilters(next)
              setPage(1)
              setActiveSlug(null)
            }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 sm:px-7">
        <BaseProductGrid
          products={visibleProducts}
          loading={loading}
          error={error}
          onRetry={() => void load()}
        />

        {!loading && !error && !activeSlug ? (
          <Pagination meta={pagination} onPageChange={setPage} />
        ) : null}
      </div>
    </div>
  )
}

export default ProductsPage
