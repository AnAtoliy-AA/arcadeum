import BlogPageContent, { type BlogPageContentProps } from './BlogPageContent';

export default function BlogClient({ t, posts, locale }: BlogPageContentProps) {
  return <BlogPageContent t={t} posts={posts} locale={locale} />;
}
