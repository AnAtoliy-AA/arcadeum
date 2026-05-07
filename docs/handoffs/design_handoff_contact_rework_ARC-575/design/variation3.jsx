/* Variation 3 — Channel-First (Violet)
   Hero leads with a grid of support channels. Form is below, lighter weight. */

function Variation3({ layout = "two", showFAQ = true, showStats = true, hero = "bleed" }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <div className="v3">
      <div className={"v3-hero " + (hero === "bleed" ? "hero-bleed" : "")}>
        <div className="v3-hero-inner col gap-3">
          <span className="label" style={{color: "var(--accent)"}}>How can we help?</span>
          <h1 className="v3-title">Pick the channel that fits.</h1>
          <p className="v3-tagline">Most things are quickest in Discord. Email if it's about an account or payment. GitHub if it's a bug we should track.</p>
          <div className="row gap-3 wrap center" style={{marginTop: 8}}>
            <StatusPill/>
            <span className="pill"><Icon.clock/> Replies within 4 hours</span>
            <span className="pill"><Icon.globe/> 5 languages</span>
          </div>
        </div>
      </div>

      <div className="v3-channels">
        {CHANNELS.map((c) => (
          <a key={c.key} className="channel v3-ch" href="#">
            <span className="ch-icon" style={{color: c.accent}}>{c.icon}</span>
            <span className="ch-meta">
              <span className="ch-title">{c.title}</span>
              <span className="ch-sub">{c.sub}</span>
            </span>
            <span className="v3-arrow">→</span>
          </a>
        ))}
      </div>

      {showStats && (
        <div className="v3-stats glass">
          <div className="row between center wrap gap-4">
            <div className="col gap-1"><span className="label">This week</span><span className="strong" style={{fontSize: 24, fontFamily: "var(--font-heading)", fontWeight: 600}}>~ 4 hrs <span className="muted" style={{fontSize: 14, fontWeight: 400}}>median first reply</span></span></div>
            <div className="col gap-1"><span className="label">Online now</span><span className="row center gap-2"><Avatars count={4}/><span className="muted" style={{fontSize: 13}}>+ 2 more</span></span></div>
            <div className="col gap-1"><span className="label">Tickets resolved</span><span className="strong" style={{fontSize: 24, fontFamily: "var(--font-heading)", fontWeight: 600}}>2,840 <span className="muted" style={{fontSize: 14, fontWeight: 400}}>this month</span></span></div>
          </div>
        </div>
      )}

      <div className="v3-form-section glass">
        <button className="v3-form-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
          <div className="col gap-1">
            <span className="label">Or write us directly</span>
            <h2 style={{fontSize: 20}}>Send a message{open ? "" : " →"}</h2>
          </div>
          <span className="chev" style={{transition: "transform .25s", transform: open ? "rotate(180deg)" : "none"}}><Icon.chev/></span>
        </button>
        {open && (
          submitted ? (
            <div className="v3-success">
              <h3 style={{fontSize: 18, marginBottom: 6}}>Got it — thank you.</h3>
              <p className="muted">We'll be in touch within 4 hours.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="col gap-5" style={{marginTop: 18}}>
              <div className={layout === "two" ? "row gap-4 wrap v3-grid-two" : "col gap-5"}>
                <div className="col" style={{flex: 1, minWidth: 200}}>
                  <label className="label" htmlFor="v3-name">Name</label>
                  <input id="v3-name" className="input" required/>
                </div>
                <div className="col" style={{flex: 1, minWidth: 200}}>
                  <label className="label" htmlFor="v3-email">Email</label>
                  <input id="v3-email" type="email" className="input" required/>
                </div>
              </div>
              <div className="col">
                <label className="label" htmlFor="v3-subject">Subject</label>
                <input id="v3-subject" className="input" required/>
              </div>
              <div className="col">
                <label className="label" htmlFor="v3-message">Message</label>
                <textarea id="v3-message" className="textarea" rows={5} required/>
              </div>
              <div className="row between center wrap gap-3">
                <span className="muted" style={{fontSize: 12.5}}>Replies go to your email.</span>
                <button type="submit" className="btn btn-primary"><Icon.send/> Send</button>
              </div>
            </form>
          )
        )}
      </div>

      {showFAQ && (
        <div className="glass v3-faq">
          <h2 style={{fontSize: 20, marginBottom: 6}}>Common questions</h2>
          <Accordion items={FAQ_ITEMS.slice(0, 3)}/>
          <a className="muted v3-faq-more" href="#">See all 120 articles →</a>
        </div>
      )}
    </div>
  );
}

window.Variation3 = Variation3;
