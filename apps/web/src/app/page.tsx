import Link from "next/link";
import styles from "./page.module.css";
import { appConfig } from "@/lib/app-config";

export default function Home() {
  const { appName, kicker, tagline, description, primaryCta, supportCta, downloads } =
    appConfig;
  const hasDownloadLinks = Boolean(downloads.iosHref || downloads.androidHref);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <span className={styles.kicker}>{kicker}</span>
        <h1 id="hero-heading" className={styles.title}>
          {appName}
        </h1>
        <p className={styles.tagline}>{tagline}</p>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Link href={primaryCta.href} className={styles.primaryAction}>
            {primaryCta.label}
          </Link>
          <Link href={supportCta.href} className={styles.secondaryAction}>
            {supportCta.label}
          </Link>
        </div>
        {hasDownloadLinks ? (
          <div className={styles.downloadSection}>
            <h2 className={styles.downloadTitle}>{downloads.title}</h2>
            <p className={styles.downloadDescription}>{downloads.description}</p>
            <div className={styles.downloadButtons}>
              {downloads.iosHref ? (
                <Link
                  href={downloads.iosHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadButton}
                >
                  <span aria-hidden="true" className={styles.downloadIcon}>
                    ↓
                  </span>
                  <span>{downloads.iosLabel}</span>
                </Link>
              ) : null}
              {downloads.androidHref ? (
                <Link
                  href={downloads.androidHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadButton}
                >
                  <span aria-hidden="true" className={styles.downloadIcon}>
                    ↓
                  </span>
                  <span>{downloads.androidLabel}</span>
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
