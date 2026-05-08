/* Variation 2 — Neon Arcade (deeper)
   Cinematic hero, animated activity feed, branded channel tiles,
   floating-label form, character counter, launch CTA. */

function NeonStarfield() {
  // Pure CSS layered radial dots — cheap, GPU-friendly, no canvas needed
  return <div className="v2-stars" aria-hidden="true"/>;
}

function ActivityTicker() {
  const items = [
    { tag: "support", who: "Maria", what: "answered a ticket", when: "12s ago", color: "#22d3ee" },
    { tag: "release", who: "v2.41", what: "shipped to production", when: "4m ago", color: "#a78bfa" },
    { tag: "bug",     who: "Anatoliy", what: "fixed lobby latency on EU-West", when: "11m ago", color: "#f472b6" },
    { tag: "support", who: "Sergey", what: "joined Discord office hours", when: "23m ago", color: "#22d3ee" },
    { tag: "status",  who: "All systems", what: "operational · 99.98% uptime", when: "—", color: "#34d399" },
  ];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % items.length), 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="v2-ticker glass" aria-live="polite">
      <span className="label" style={{margin: 0, fontSize: 11}}>HQ live feed</span>
      <div className="v2-ticker-track">
        {items.map((it, i) => (
          <div key={i} className="v2-ticker-row" data-active={i === idx}>
            <span className="v2-ticker-tag" style={{color: it.color, borderColor: it.color}}>{it.tag}</span>
            <span><strong>{it.who}</strong> <span className="muted">{it.what}</span></span>
            <span className="muted v2-ticker-when">{it.when}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingInput({ id, label, type = "text", required, multiline, value, onChange, maxLength, autoComplete }) {
  const [focused, setFocused] = React.useState(false);
  const filled = (value ?? "").length > 0;
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={"v2-fl " + (focused ? "is-focus " : "") + (filled ? "is-filled " : "") + (multiline ? "is-multi" : "")}>
      <Tag
        id={id}
        type={multiline ? undefined : type}
        className={multiline ? "textarea" : "input"}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={multiline ? 6 : undefined}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder=" "
      />
      <label htmlFor={id}>{label}{required && <span className="v2-req"> *</span>}</label>
      {maxLength && multiline && (
        <span className="v2-counter" data-warn={(value?.length ?? 0) > maxLength * 0.85}>
          {(value?.length ?? 0)} / {maxLength}
        </span>
      )}
    </div>
  );
}

function Variation2({ layout = "two", showFAQ = true, showStats = true, hero = "bleed" }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [launching, setLaunching] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", subject: "", message: "" });
  const upd = (k) => (v) => setForm(s => ({...s, [k]: v}));
  const onSubmit = (e) => {
    e.preventDefault();
    setLaunching(true);
    setTimeout(() => { setSubmitted(true); setLaunching(false); }, 700);
  };

  const channelTiles = [
    { key: "discord",  title: "Discord",        sub: "Live chat · 12.4k members",   icon: <Icon.discord/>,  grad: "linear-gradient(135deg,#5865f2 0%,#8b5cf6 100%)" },
    { key: "twitter",  title: "@arcadeum",      sub: "DMs are open",                 icon: <Icon.twitter/>,  grad: "linear-gradient(135deg,#0f1419 0%,#1a8cd8 100%)" },
    { key: "telegram", title: "Telegram",       sub: "t.me/arcadeum",                icon: <Icon.telegram/>, grad: "linear-gradient(135deg,#229ed9 0%,#26a5e4 100%)" },
    { key: "github",   title: "GitHub Issues",  sub: "Bugs &amp; feature requests",  icon: <Icon.github/>,   grad: "linear-gradient(135deg,#1f2328 0%,#6e40c9 100%)" },
  ];

  return (
    <div className="v2 v2-deep">
      {/* HERO */}
      <div className={"v2-hero " + (hero === "bleed" ? "hero-bleed" : "")}>
        <NeonStarfield/>
        <div className="v2-grid" aria-hidden="true"/>
        <div className="v2-orb v2-orb-a" aria-hidden="true"/>
        <div className="v2-orb v2-orb-b" aria-hidden="true"/>

        <div className="v2-hero-inner">
          <div className="row gap-3 center wrap" style={{marginBottom: 18}}>
            <span className="v2-eyebrow"><span className="v2-eyebrow-dot"/> Player support</span>
            <span className="muted" style={{fontSize: 13}}>arcadeum.games / contact</span>
          </div>
          <h1 className="v2-title">
            We're on the same <span className="v2-title-grad">team.</span>
          </h1>
          <p className="v2-tagline">
            Drop a question, report a bug, hand us a feature idea — we read every message and the whole team plays the games we ship.
          </p>
          <div className="row gap-3 wrap center" style={{marginTop: 22}}>
            <StatusPill/>
            <span className="pill"><Icon.clock/> ~ 4 hr median reply</span>
            <span className="pill"><Avatars count={3}/>&nbsp; 3 humans online</span>
            <span className="pill"><Icon.globe/> 5 languages</span>
          </div>
          <div className="v2-hero-foot">
            <ActivityTicker/>
          </div>
        </div>
      </div>

      {/* STATS */}
      {showStats && (
        <div className="v2-stat-strip">
          <div className="v2-stat"><span className="num">2,840</span><span className="lbl">Tickets resolved this month</span><span className="v2-spark"/></div>
          <div className="v2-stat"><span className="num">4.9 ★</span><span className="lbl">Avg. support rating</span><span className="v2-spark"/></div>
          <div className="v2-stat"><span className="num">5</span><span className="lbl">Languages supported</span><span className="v2-spark"/></div>
          <div className="v2-stat"><span className="num">98%</span><span className="lbl">SLA hit rate</span><span className="v2-spark"/></div>
        </div>
      )}

      {/* CHANNEL TILES */}
      <div className="v2-tiles">
        {channelTiles.map(c => (
          <a key={c.key} className="v2-tile" href="#" style={{"--tile-grad": c.grad}}>
            <span className="v2-tile-icon">{c.icon}</span>
            <span className="v2-tile-meta">
              <span className="v2-tile-title">{c.title}</span>
              <span className="v2-tile-sub" dangerouslySetInnerHTML={{__html: c.sub}}/>
            </span>
            <span className="v2-tile-arrow">→</span>
            <span className="v2-tile-glow" aria-hidden="true"/>
          </a>
        ))}
      </div>

      {/* FORM + SIDE */}
      <div className={"v2-body " + (layout === "two" ? "two" : "one")}>
        <div className="v2-form-wrap">
          <div className="glass v2-form">
            <div className="row between center wrap gap-3" style={{marginBottom: 4}}>
              <div className="col gap-1">
                <span className="label">Direct message</span>
                <h2 style={{fontSize: 24}}>Send the team a message</h2>
              </div>
              <span className="row gap-2 center">
                <Avatars count={3}/>
                <span className="muted" style={{fontSize: 13}}>Replies hit your email</span>
              </span>
            </div>
            <hr className="v2-rule"/>
            {submitted ? (
              <div className="v2-success">
                <div className="v2-burst">✦</div>
                <h3 style={{fontSize: 22}}>Message away.</h3>
                <p className="muted">Expect a reply within 4 hours. We sent a copy to your email.</p>
                <button className="btn" onClick={() => { setSubmitted(false); setForm({name: "", email: "", subject: "", message: ""}); }} style={{marginTop: 16}}>Send another</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="col gap-5">
                <div className={layout === "two" ? "row gap-4 wrap v2-grid-two" : "col gap-5"}>
                  <div style={{flex: 1, minWidth: 200}}>
                    <FloatingInput id="v2-name" label="Your name" required value={form.name} onChange={upd("name")} autoComplete="name"/>
                  </div>
                  <div style={{flex: 1, minWidth: 200}}>
                    <FloatingInput id="v2-email" label="Email" type="email" required value={form.email} onChange={upd("email")} autoComplete="email"/>
                  </div>
                </div>
                <FloatingInput id="v2-subject" label="Subject" required value={form.subject} onChange={upd("subject")}/>
                <FloatingInput id="v2-message" label="Message" required multiline maxLength={1200} value={form.message} onChange={upd("message")}/>
                <div className="row between center wrap gap-3">
                  <span className="muted row center gap-2" style={{fontSize: 12.5}}>
                    <span className="v2-lock">🔒</span> Private — we never share your email.
                  </span>
                  <button type="submit" className={"btn btn-primary v2-cta " + (launching ? "is-launching" : "")}>
                    <span className="v2-cta-rocket"><Icon.send/></span>
                    <span className="v2-cta-label">{launching ? "Sending…" : "Launch message"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {layout === "two" && (
          <aside className="v2-side col gap-4">
            <div className="glass v2-side-card">
              <span className="label">On call right now</span>
              <div className="row center gap-3" style={{marginTop: 8}}>
                <Avatars count={4}/>
                <div className="col">
                  <span className="strong" style={{fontWeight: 600}}>Maria, Anatoliy +2</span>
                  <span className="muted" style={{fontSize: 12.5}}>Support · EU + LATAM</span>
                </div>
              </div>
              <hr className="v2-rule"/>
              <div className="col gap-2" style={{fontSize: 13.5}}>
                <span className="row between"><span className="muted">Median first reply</span><strong>4 hr</strong></span>
                <span className="row between"><span className="muted">Working hours</span><strong>Mon – Fri, 10:00 – 18:00</strong></span>
                <span className="row between"><span className="muted">Coverage</span><strong>GMT-5 → GMT+8</strong></span>
              </div>
            </div>

            <div className="glass v2-side-card">
              <span className="label">For developers</span>
              <h3 style={{fontSize: 16, marginTop: 6, marginBottom: 8}}>Bugs &amp; integration</h3>
              <p className="muted" style={{fontSize: 13.5, lineHeight: 1.55, marginBottom: 12}}>Reproducible bugs, API issues, and SDK questions are tracked in GitHub. We triage within 24 hours.</p>
              <a className="btn" href="#" style={{width: "100%"}}><Icon.github/> Open an issue</a>
            </div>

            <div className="glass v2-side-card">
              <span className="label">Press &amp; partnerships</span>
              <a href="mailto:hello@arcadeum.games" className="strong" style={{display: "block", marginTop: 6, fontWeight: 600}}>hello@arcadeum.games</a>
              <p className="muted" style={{fontSize: 13.5, marginTop: 4}}>For media, creators, and partner studios.</p>
            </div>
          </aside>
        )}
      </div>

      {/* FAQ */}
      {showFAQ && (
        <div className="glass v2-faq">
          <div className="row between center wrap gap-3" style={{marginBottom: 10}}>
            <div className="col gap-1">
              <span className="label">Common questions</span>
              <h2 style={{fontSize: 24}}>Maybe we already answered this</h2>
            </div>
            <a className="btn" href="#"><Icon.doc/> Browse help center</a>
          </div>
          <Accordion items={FAQ_ITEMS}/>
        </div>
      )}
    </div>
  );
}

window.Variation2 = Variation2;
