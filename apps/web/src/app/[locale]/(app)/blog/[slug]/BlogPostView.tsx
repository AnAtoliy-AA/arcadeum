import Link from 'next/link';
import { Container, PageLayout } from '@arcadeum/ui';
import type { BlogPost } from '@/features/blog/types';
import { cx } from '@arcadeum/ui/utils/cx';
import { InteractiveGuideBoard } from '@/features/blog/ui/InteractiveGuideBoard';

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
      <Container size="md">
        <nav
          aria-label="Breadcrumb"
          className="my-4 text-sm text-[var(--color-text-muted,rgba(255,255,255,0.6))]"
        >
          <ol className="flex flex-wrap gap-2 list-none p-0 m-0 [&>li+li:before]:content-['›'] [&>li+li:before]:mr-2 [&>li+li:before]:opacity-60">
            <li>
              <Link
                href={homeHref}
                className="text-inherit no-underline border-b border-transparent hover:border-current"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={blogHref}
                className="text-inherit no-underline border-b border-transparent hover:border-current"
              >
                {blogIndexLabel}
              </Link>
            </li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>

        <article className="max-w-[72ch] mx-auto py-6 pb-14">
          <header className="mb-8 pb-6 border-b border-[var(--color-border,rgba(255,255,255,0.08))]">
            <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.15] m-0 mb-3">
              {post.title}
            </h1>
            <p className="text-lg leading-[1.5] m-0 mb-4 text-[var(--color-text-muted,rgba(255,255,255,0.85))]">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap gap-2 items-center text-sm text-[var(--color-text-muted,rgba(255,255,255,0.7))] mb-4">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(post.locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span aria-hidden>·</span>
              <span>{post.readingTimeMinutes} min</span>
              <span aria-hidden>·</span>
              <span>{post.author}</span>
            </div>
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="text-xs px-2 py-[0.2rem] rounded-full bg-[var(--color-surface,rgba(255,255,255,0.06))] text-[var(--color-text-muted,rgba(255,255,255,0.85))] border border-[var(--color-border,rgba(255,255,255,0.08))]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </header>

          <div className="text-base leading-[1.75] text-[var(--color-text,rgba(255,255,255,0.92))]">
            {post.body.map((block, index) => {
              switch (block.type) {
                case 'heading': {
                  if (block.level === 2) {
                    return (
                      <h2
                        key={index}
                        id={block.id}
                        className="text-[clamp(1.5rem,3vw,1.875rem)] font-bold mt-9 mb-3 leading-[1.25]"
                      >
                        {block.text}
                      </h2>
                    );
                  }
                  return (
                    <h3
                      key={index}
                      id={block.id}
                      className="text-xl font-semibold mt-6 mb-2 leading-[1.3]"
                    >
                      {block.text}
                    </h3>
                  );
                }
                case 'paragraph':
                  return (
                    <p key={index} className="m-0 mb-[1.1rem]">
                      {block.text}
                    </p>
                  );
                case 'list':
                  return (
                    <ul key={index} className="m-0 mb-5 pl-5">
                      {block.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  );
                case 'cta':
                  return (
                    <aside
                      key={index}
                      className="my-7 p-0 rounded-xl bg-gradient-to-br from-[rgba(64,145,220,0.18)] to-[rgba(64,145,220,0.06)] border border-[rgba(64,145,220,0.35)]"
                    >
                      <Link
                        href={block.href}
                        className="flex items-center gap-3 flex-wrap p-4 px-5 no-underline text-inherit rounded-[inherit] transition-[background] duration-[120ms] ease hover:bg-[rgba(64,145,220,0.1)]"
                      >
                        <strong className="text-base font-bold flex-[1_1_70%]">
                          {block.text}
                        </strong>
                        {block.description && (
                          <span className="flex-[1_1_100%] text-[0.9375rem] text-[var(--color-text-muted,rgba(255,255,255,0.78))]">
                            {block.description}
                          </span>
                        )}
                        <span className="text-1.5rem flex-none" aria-hidden>
                          →
                        </span>
                      </Link>
                    </aside>
                  );
                case 'stat-card':
                  return (
                    <div
                      key={index}
                      className="my-7 p-5 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.06))] border border-[var(--color-border,rgba(255,255,255,0.08))]"
                    >
                      <h3 className="text-lg font-semibold m-0 mb-4">
                        {block.title}
                      </h3>
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4">
                        {block.stats.map((stat, statIndex) => (
                          <div
                            key={statIndex}
                            className="flex flex-col items-center text-center py-3 px-2 rounded-lg bg-[var(--color-bg,rgba(0,0,0,0.2))]"
                          >
                            <span className="text-[1.75rem] font-bold leading-[1.1]">
                              {stat.value}
                            </span>
                            <span className="text-[0.8125rem] text-[var(--color-text-muted,rgba(255,255,255,0.7))] mt-1">
                              {stat.label}
                            </span>
                            {stat.description && (
                              <span className="text-xs text-[var(--color-text-muted,rgba(255,255,255,0.5))] mt-[0.15rem]">
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
                    <div key={index} className="my-7">
                      <Link
                        href={`/replay/${block.replayId}`}
                        className="flex items-center gap-3 p-4 px-5 rounded-xl bg-gradient-to-br from-[rgba(124,58,237,0.18)] to-[rgba(124,58,237,0.06)] border border-[rgba(124,58,237,0.35)] no-underline text-inherit transition-[background] duration-[120ms] ease hover:bg-[rgba(124,58,237,0.1)]"
                      >
                        <span
                          className="text-1.5rem flex-none w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(124,58,237,0.25)]"
                          aria-hidden
                        >
                          ▶
                        </span>
                        <div>
                          <strong className="text-base font-bold block">
                            {block.title}
                          </strong>
                          {block.description && (
                            <span className="text-sm text-[var(--color-text-muted,rgba(255,255,255,0.7))] block mt-[0.15rem]">
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
                      className="my-7 p-5 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.06))] border border-[var(--color-border,rgba(255,255,255,0.08))]"
                    >
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--color-border,rgba(255,255,255,0.08))]">
                        <span className="text-lg font-bold font-mono px-2 py-[0.15rem] rounded bg-[rgba(64,145,220,0.2)]">
                          {block.version}
                        </span>
                        <time
                          className="text-sm text-[var(--color-text-muted,rgba(255,255,255,0.7))]"
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
                            sIndex < block.sections.length - 1 && 'mb-3',
                          )}
                        >
                          <span
                            className={cx(
                              'inline-block text-[0.6875rem] font-semibold uppercase tracking-[0.05em] px-2 py-[0.15rem] rounded-full mb-[0.35rem]',
                              section.type === 'added' &&
                                'bg-[rgba(34,197,94,0.2)] text-[#22c55e]',
                              section.type === 'changed' &&
                                'bg-[rgba(59,130,246,0.2)] text-[#3b82f6]',
                              section.type === 'fixed' &&
                                'bg-[rgba(234,179,8,0.2)] text-[#eab308]',
                              section.type === 'removed' &&
                                'bg-[rgba(239,68,68,0.2)] text-[#ef4444]',
                            )}
                          >
                            {section.type}
                          </span>
                          <ul className="m-0 pl-5">
                            {section.items.map((item, iIndex) => (
                              <li
                                key={iIndex}
                                className="mb-[0.3rem] text-[0.9375rem]"
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
                    <div key={index} className="my-7">
                      {block.title && (
                        <h4 className="text-base font-semibold m-0 mb-3">
                          {block.title}
                        </h4>
                      )}
                      <div className="p-4 px-5 rounded-xl bg-[var(--color-surface,rgba(255,255,255,0.06))] border border-[var(--color-border,rgba(255,255,255,0.08))] overflow-x-auto">
                        <table className="w-full border-collapse text-['SF_Mono','Fira_Code','Consolas',monospace] text-[0.9375rem]">
                          <tbody>
                            {rows.map((pair, rIndex) => (
                              <tr key={rIndex}>
                                <td className="w-12 text-right py-1 px-2 text-[var(--color-text-muted,rgba(255,255,255,0.5))] select-none tabular-nums">
                                  {rIndex + 1}.
                                </td>
                                <td className="py-1 px-3 rounded bg-[rgba(255,255,255,0.04)] font-semibold text-center min-w-[4rem]">
                                  {pair[0]}
                                </td>
                                <td className="py-1 px-3 rounded bg-[rgba(255,255,255,0.02)] text-center min-w-[4rem]">
                                  {pair[1] ?? ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {block.result && (
                          <div className="mt-3 pt-2 border-t border-[var(--color-border,rgba(255,255,255,0.08))] font-bold text-base text-right">
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
              className="mt-10 pt-6 border-t border-[var(--color-border,rgba(255,255,255,0.08))]"
              aria-labelledby="faq-heading"
            >
              <h2
                id="faq-heading"
                className="text-[clamp(1.5rem,3vw,1.875rem)] font-bold mt-9 mb-3 leading-[1.25]"
              >
                Frequently Asked Questions
              </h2>
              <dl>
                {post.faq.map((item, index) => (
                  <div key={index} className="mb-6">
                    <dt className="font-semibold text-[1.05rem] mb-[0.35rem]">
                      {item.question}
                    </dt>
                    <dd className="m-0 text-[var(--color-text-muted,rgba(255,255,255,0.85))] leading-[1.65]">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </article>
      </Container>
    </PageLayout>
  );
}
