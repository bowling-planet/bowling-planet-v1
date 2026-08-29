import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IBaseProduct } from '../services/baseProductsApi'
import MediaItem from '../../../components/common/MediaItem'
import { ArrowUpRight, Plus, Check, Layers } from 'lucide-react'
import { useLeadTracker } from '../../../context/LeadTrackerContext'

interface BaseProductCardProps {
  product: IBaseProduct
}

function truncate(text: string, max = 90): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

const BaseProductCard: FC<BaseProductCardProps> = ({ product }) => {
  const navigate = useNavigate()
  const { state, addToEnquiry } = useLeadTracker()
  const id = product._id || product.slug
  const isAdded = state.enquiryCart.some((i) => i.id === id)

  return (
    <article
      id={`category-${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111118] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#5FC1D1]/45 hover:shadow-[0_12px_40px_rgba(95,193,209,0.1)]"
    >
      <button
        type="button"
        onClick={() => navigate(`/products/${product.slug}`)}
        className="relative block aspect-[16/9] w-full cursor-pointer overflow-hidden bg-[#0A0A0F] text-left"
        aria-label={`Browse ${product.title} category`}
      >
        <MediaItem
          media={product.thumbnail}
          alt={product.title}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {/* Removed vignette effect per user request */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#5FC1D1] backdrop-blur-sm">
          <Layers size={11} />
          Category
        </span>
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-[#F5F5F7] backdrop-blur-sm transition-colors group-hover:border-[#5FC1D1]/50 group-hover:text-[#5FC1D1]">
          <ArrowUpRight size={14} />
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <button
          type="button"
          onClick={() => navigate(`/products/${product.slug}`)}
          className="cursor-pointer text-left"
        >
          <h3 className="font-display text-base font-bold leading-snug text-[#F5F5F7] transition-colors group-hover:text-[#5FC1D1]">
            {product.title}
          </h3>
          {product.description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-[#A1A1A6]">
              {truncate(product.description)}
            </p>
          ) : null}
        </button>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
          <button
            type="button"
            onClick={() => navigate(`/products/${product.slug}`)}
            className="cursor-pointer text-sm font-semibold text-[#5FC1D1] hover:underline"
          >
            View products →
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              addToEnquiry({ id, type: 'product', title: product.title })
            }}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isAdded
                ? 'border-[#6DBD4E]/45 bg-[#6DBD4E]/10 text-[#6DBD4E]'
                : 'border-white/15 text-[#F5F5F7] hover:border-[#5FC1D1]/45 hover:text-[#5FC1D1]'
            }`}
          >
            {isAdded ? <Check size={12} /> : <Plus size={12} />}
            {isAdded ? 'Added' : 'Enquire'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default BaseProductCard
