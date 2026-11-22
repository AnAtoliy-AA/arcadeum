import type { ReactNode } from 'react';
import s from './GameCreateView.module.scss';
import f from './CreateFlow.module.scss';

interface Props {
  num: string;
  title: string;
  /** One plain sentence: what this step is and why it matters. */
  why?: string;
  /** Anchor id so the step nav can jump here. */
  id?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionGroup({
  num,
  title,
  why,
  id,
  hint,
  action,
  children,
}: Props) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={f.stepAnchor}>
      <div className={s.sectionHead}>
        <div className={s.sectionHeadLeft}>
          <span className={s.sectionNum}>{num} ·</span>
          <h2 id={headingId} className={s.sectionTitle}>
            {title}
          </h2>
        </div>
        {hint ? <span className={s.sectionHint}>{hint}</span> : action}
      </div>
      {why ? <p className={f.stepWhy}>{why}</p> : null}
      <div>{children}</div>
    </section>
  );
}
