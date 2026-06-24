import Link from 'next/link';
import styles from './CascadeLanding.module.scss';

interface Props {
  title: string;
  subtitle: string;
  createRoomHref: string;
  roomsHref: string;
  createRoomLabel: string;
  browseRoomsLabel: string;
}

const FAN = [
  { color: '#dc2626', label: '7', rotate: -16, dx: -120 },
  { color: '#fbbf24', label: '+2', rotate: 0, dx: 0 },
  { color: '#3b82f6', label: '↻', rotate: 16, dx: 120 },
];

export function CascadeHero({
  title,
  subtitle,
  createRoomHref,
  roomsHref,
  createRoomLabel,
  browseRoomsLabel,
}: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroSubtitle}>{subtitle}</p>
        <div className={styles.heroButtons}>
          <Link href={createRoomHref} className={styles.heroCta}>
            {createRoomLabel}
          </Link>
          <Link href={roomsHref} className={styles.heroSecondary}>
            {browseRoomsLabel}
          </Link>
        </div>
      </div>

      <div className={styles.heroArt} aria-hidden>
        <div className={styles.heroArtInner}>
          {FAN.map((c, i) => (
            <div
              key={i}
              className={styles.heroCard}
              style={{
                background: c.color,
                transform: `translate(${c.dx}px, 0) rotate(${c.rotate}deg)`,
              }}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
