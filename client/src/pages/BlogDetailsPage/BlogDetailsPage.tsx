import { type FC } from 'react'
import SEO from '../../components/SEO'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import {
  getBlogBySlug,
  getRelatedBlogs,
} from './services/blogDetailsApi'
import BlogHeader from './components/BlogHeader'
import BlogCoverImage from './components/BlogCoverImage'
import BlogContent from './components/BlogContent'
import RelatedBlogs from './components/RelatedBlogs'
import styles from './BlogDetailsPage.module.css'

const BlogDetailsPage: FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['public-blog-details', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Blog not found.');
      const [detail, relatedItems] = await Promise.all([
        getBlogBySlug(slug),
        getRelatedBlogs(slug),
      ]);
      return { blog: detail, related: relatedItems };
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })

  const blog = data?.blog || null;
  const related = data?.related || [];

  if (loading) {
    return (
      <main className={styles.page}>
        <Loader label="Loading blog…" />
      </main>
    )
  }

  if (error || !blog) {
    return (
      <main className={styles.page}>
        <div className={styles.missing}>
          <ErrorState
            message={error ? error.message : 'Blog not found.'}
            onRetry={error ? () => void refetch() : undefined}
          />
          <p>
            <Link to="/blog">Back to insights</Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <SEO 
        title={blog.title} 
        description={blog.excerpt || blog.title}
        ogImage={blog.coverImage?.url}
        schemaMarkup={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: blog.title,
          description: blog.excerpt || blog.title,
          image: blog.coverImage?.url,
          author: {
            '@type': 'Person',
            name: blog.author || 'Bowling Planet',
          },
          datePublished: blog.publishedAt,
          publisher: {
            '@type': 'Organization',
            name: 'Bowling Planet',
            logo: {
              '@type': 'ImageObject',
              url: 'https://res.cloudinary.com/dzs0nvuqx/image/upload/v1731666687/bowling-planet-og_xzyxyz.jpg'
            }
          }
        }}
      />
      <BlogHeader
        title={blog.title}
        author={blog.author}
        publishedAt={blog.publishedAt}
        tags={blog.tags}
      />
      <BlogCoverImage coverImage={blog.coverImage} title={blog.title} />
      <BlogContent content={blog.content} />
      <RelatedBlogs blogs={related} />
    </main>
  )
}

export default BlogDetailsPage
