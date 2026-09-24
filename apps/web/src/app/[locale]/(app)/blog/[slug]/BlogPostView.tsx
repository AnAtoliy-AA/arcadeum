import Link from 'next/link';
import { Container, PageLayout } from '@arcadeum/ui';
import type { BlogPost } from '@/features/blog/types';
import { cx } from '@arcadeum/ui/utils/cx';
import { InteractiveGuideBoard } from '@/features/blog/ui/InteractiveGuideBoard';
import { TableOfContents } from '@/features/blog/ui/TableOfContents';
import { BlogReadingProgress } from '@/features/blog/ui/BlogReadingProgress';
import { BlogShareButton } from '@/features/blog/ui/BlogShareButton';

interface Props {
  post: BlogPost;
  homeHref: string;
  blogHref: string;
  blogIndexLabel: string;
}

export function BlogPostView({
  post,
  homeHref,
  blogHref,
  blogIndexLabel,
}: Props) {
  return (
    <PageLayout>
      <BlogReadingProgress />

      <Container size="xl">
        <nav
          aria-label="Breadcrumb"
          className="my-4 text-sm text-[var(--colorMuted)]"
        >
          <ol className="flex flex-wrap gap-2 list-none p-0 m-0 [&>li+li:before]:content-['›'] [&>li+li:before]:mr-2 [&>li+li:before]:opacity-60">
            <li>
              <Link
                href={homeHref}
                className="text-inherit no-underline border-b border-transparent hover:border-current transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={blogHref}
                className="text-inherit no-underline border-b border-transparent hover:border-current transition-colors"
              >
                {blogIndexLabel}
              </Link>
            </li>
            <li
              aria-current="page"
              className="opacity-70 truncate max-w-[24ch]"
            >
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="flex items-start gap-12 pb-20">
          <article className="min-w-0 flex-1 max-w-[72ch] mx-auto xl:mx-0">
            <header className="mb-10 pb-8 border-b border-[var(--borderColor)]">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-[var(--glassBg)] text-[var(--primary)] border border-[var(--primary)]/30 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-[clamp(2rem,4vw,2.875rem)] font-extrabold leading-[1.12] m-0 mb-4 text-[var(--color)]">
                {post.title}
              </h1>

              <p className="text-lg leading-[1.6] m-0 mb-6 text-[var(--colorMuted)]">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center text-sm text-[var(--colorMuted)]">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="text-base">
                      ✍️
                    </span>
                    {post.author}
                  </span>
                  <span aria-hidden className="opacity-40">
                    ·
                  </span>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString(
                      post.locale,
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      },
                    )}
                  </time>
                  <span aria-hidden className="opacity-40">
                    ·
                  </span>
                  <span className="flex items-center gap-1">
                    <span aria-hidden>⏱</span>
                    {post.readingTimeMinutes} min read
                  </span>
                </div>

                <BlogShareButton title={post.title} />
              </div>
            </header>

            <div className="text-base leading-[1.8] text-[var(--color)]">
              {post.body.map((block, index) => {
                switch (block.type) {
                  case 'heading': {
                    if (block.level === 2) {
                      return (
                        <h2
                          key={index}
                          id={block.id}
                          className="text-[clamp(1.5rem,3vw,1.875rem)] font-bold mt-12 mb-4 leading-[1.25] scroll-mt-20 text-[var(--color)]"
                        >
                          {block.text}
                        </h2>
                      );
                    }
                    return (
                      <h3
                        key={index}
                        id={block.id}
                        className="text-xl font-semibold mt-8 mb-3 leading-[1.3] scroll-mt-20 text-[var(--color)]"
                      >
                        {block.text}
                      </h3>
                    );
                  }
                  case 'paragraph':
                    return (
                      <p
                        key={index}
                        className="m-0 mb-5 text-[var(--colorMuted)] leading-[1.8]"
                      >
                        {block.text}
                      </p>
                    );
                  case 'list':
                    return (
                      <ul
                        key={index}
                        className="m-0 mb-6 pl-0 list-none flex flex-col gap-2"
                      >
                        {block.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex gap-3 text-[var(--colorMuted)] leading-[1.7]"
                          >
                            <span
                              className="mt-[0.4em] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--primary)]"
                              aria-hidden
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  case 'cta':
                    return (
                      <aside
                        key={index}
                        className="my-8 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 overflow-hidden"
                      >
                        <Link
                          href={block.href}
                          className="flex items-center gap-4 flex-wrap p-5 px-6 no-underline text-inherit rounded-[inherit] transition-all duration-200 hover:bg-[var(--primary)]/10 group"
                        >
                          <div className="flex-1 min-w-0">
                            <strong className="block text-base font-bold text-[var(--color)] group-hover:text-[var(--primary)] transition-colors">
                              {block.text}
                            </strong>
                            {block.description && (
                              <span className="block text-sm text-[var(--colorMuted)] mt-1 leading-relaxed">
                                {block.description}
                              </span>
                            )}
                          </div>
                          <span
                            className="text-xl text-[var(--primary)] flex-none transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden
                          >
                            →
                          </span>
                        </Link>
                      </aside>
                    );
                  case 'stat-card':
                    return (
                      <div
                        key={index}
                        className="my-8 p-6 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] backdrop-blur-sm"
                      >
                        <h3 className="text-base font-bold m-0 mb-5 text-[var(--color)]">
                          {block.title}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {block.stats.map((stat, statIndex) => (
                            <div
                              key={statIndex}
                              className="flex flex-col items-center text-center py-4 px-3 rounded-xl bg-[var(--glassBg)] border border-[var(--borderColor)]"
                            >
                              <span className="text-[1.875rem] font-extrabold leading-[1.1] text-[var(--primary)]">
                                {stat.value}
                              </span>
                              <span className="text-[0.8125rem] font-semibold text-[var(--color)] mt-1.5">
                                {stat.label}
                              </span>
                              {stat.description && (
                                <span className="text-[0.6875rem] text-[var(--colorMuted)] mt-0.5 leading-snug">
                                  {stat.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  case 'replay-embed':
                    return (
                      <div key={index} className="my-8">
                        <Link
                          href={`/replay/${block.replayId}`}
                          className="flex items-center gap-4 p-5 rounded-2xl bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.3)] no-underline text-inherit transition-all duration-200 hover:border-[rgba(124,58,237,0.6)] group"
                        >
                          <span
                            className="text-xl flex-none w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(124,58,237,0.15)] group-hover:bg-[rgba(124,58,237,0.3)] transition-colors"
                            aria-hidden
                          >
                            ▶
                          </span>
                          <div>
                            <strong className="text-base font-bold block text-[var(--color)]">
                              {block.title}
                            </strong>
                            {block.description && (
                              <span className="text-sm text-[var(--colorMuted)] block mt-0.5">
                                {block.description}
                              </span>
                            )}
                          </div>
                        </Link>
                      </div>
                    );
                  case 'patch-note':
                    return (
                      <div
                        key={index}
                        className="my-8 p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)]"
                      >
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--borderColor)]">
                          <span className="text-lg font-bold font-mono px-2.5 py-1 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)]">
                            {block.version}
                          </span>
                          <time
                            className="text-sm text-[var(--colorMuted)]"
                            dateTime={block.date}
                          >
                            {new Date(block.date).toLocaleDateString(
                              post.locale,
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            )}
                          </time>
                        </div>
                        {block.sections.map((section, sIndex) => (
                          <div
                            key={sIndex}
                            className={cx(
                              sIndex < block.sections.length - 1 && 'mb-4',
                            )}
                          >
                            <span
                              className={cx(
                                'inline-block text-[0.6875rem] font-semibold uppercase tracking-[0.07em] px-2.5 py-1 rounded-full mb-2',
                                section.type === 'added' &&
                                  'bg-[rgba(34,197,94,0.12)] text-[#16a34a]',
                                section.type === 'changed' &&
                                  'bg-[rgba(59,130,246,0.12)] text-[#2563eb]',
                                section.type === 'fixed' &&
                                  'bg-[rgba(234,179,8,0.12)] text-[#b45309]',
                                section.type === 'removed' &&
                                  'bg-[rgba(239,68,68,0.12)] text-[#dc2626]',
                              )}
                            >
                              {section.type}
                            </span>
                            <ul className="m-0 pl-4 flex flex-col gap-1">
                              {section.items.map((item, iIndex) => (
                                <li
                                  key={iIndex}
                                  className="text-[0.9375rem] text-[var(--colorMuted)]"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    );
                  case 'chess-notation': {
                    const rows: string[][] = [];
                    for (let i = 0; i < block.moves.length; i += 2) {
                      rows.push(block.moves.slice(i, i + 2));
                    }
                    return (
                      <div key={index} className="my-8">
                        {block.title && (
                          <h4 className="text-sm font-semibold m-0 mb-3 text-[var(--colorMuted)] uppercase tracking-wider">
                            {block.title}
                          </h4>
                        )}
                        <div className="p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)] overflow-x-auto">
                          <table className="w-full border-collapse font-mono text-[0.9375rem]">
                            <tbody>
                              {rows.map((pair, rIndex) => (
                                <tr
                                  key={rIndex}
                                  className={cx(
                                    rIndex % 2 === 0 &&
                                      'bg-[var(--primary)]/[0.03]',
                                  )}
                                >
                                  <td className="w-10 text-right py-1.5 px-3 text-[var(--colorMuted)] select-none tabular-nums text-xs">
                                    {rIndex + 1}.
                                  </td>
                                  <td className="py-1.5 px-4 font-semibold text-[var(--primary)] min-w-[5rem]">
                                    {pair[0]}
                                  </td>
                                  <td className="py-1.5 px-4 text-[var(--color)] min-w-[5rem]">
                                    {pair[1] ?? ''}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {block.result && (
                            <div className="mt-3 pt-3 border-t border-[var(--borderColor)] font-bold text-base text-right text-[var(--primary)]">
                              {block.result}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  case 'interactive-puzzle':
                    return (
                      <InteractiveGuideBoard
                        key={block.id}
                        id={block.id}
                        title={block.title}
                        prompt={block.prompt}
                        gameId={block.gameId}
                        board={block.board}
                        solutionIndex={block.solutionIndex}
                        explanation={block.explanation}
                        playHref={block.playHref}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>

            {post.faq && post.faq.length > 0 && (
              <section
                className="mt-12 pt-8 border-t border-[var(--borderColor)]"
                aria-labelledby="faq-heading"
              >
                <h2
                  id="faq-heading"
                  className="text-[clamp(1.375rem,2.5vw,1.75rem)] font-bold mb-6 leading-[1.25] text-[var(--color)]"
                >
                  Frequently Asked Questions
                </h2>
                <dl className="flex flex-col gap-5">
                  {post.faq.map((item, index) => (
                    <div
                      key={index}
                      className="p-5 rounded-2xl bg-[var(--glassBg)] border border-[var(--borderColor)]"
                    >
                      <dt className="font-bold text-[1.0625rem] mb-2 text-[var(--color)]">
                        {item.question}
                      </dt>
                      <dd className="m-0 text-[var(--colorMuted)] leading-[1.7] text-[0.9375rem]">
                        {item.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </article>

          <TableOfContents blocks={post.body} />
        </div>
      </Container>
    </PageLayout>
  );
}
