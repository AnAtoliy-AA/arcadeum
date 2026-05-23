import type { ReactNode } from 'react';
import s from './GameCreateView.module.css';

interface Props {
  num: string;
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionGroup({ num, title, hint, action, children }: Props) {
  return (
    <section>
      <div className={s.sectionHead}>
        <div className={s.sectionHeadLeft}>
          <span className={s.sectionNum}>{num} ·</span>
          <h2 className={s.sectionTitle}>{title}</h2>
        </div>
        {hint ? <span className={s.sectionHint}>{hint}</span> : action}
      </div>
      <div>{children}</div>
    </section>
  );
}
