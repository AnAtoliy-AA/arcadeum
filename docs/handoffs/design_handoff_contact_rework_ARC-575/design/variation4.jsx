/* Variation 4 — Concierge (Teal)
   Conversational, messaging-like. Live FAQ suggestions appear as the user types. */

function Variation4({ layout = "one", showFAQ = true, showStats = true, hero = "bleed" }) {
  const [submitted, setSubmitted] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  // Naive keyword match for live suggestions
  const suggestion = React.useMemo(() => {
    const t = draft.toLowerCase();
    if (!t || t.length < 6) return null;
    if (t.includes("refund") || t.includes("charge") || t.includes("payment")) return FAQ_ITEMS[0];
    if (t.includes("password") || t.includes("login") || t.includes("sign in") || t.includes("can't log")) return FAQ_ITEMS[1];
    if (t.includes("delete") || t.includes("close my account") || t.includes("remove account")) return FAQ_ITEMS[2];
    if (t.includes("lag") || t.includes("slow") || t.includes("ping") || t.includes("multiplayer")) return FAQ_ITEMS[3];
    if (t.includes("report") || t.includes("toxic") || t.includes("cheat")) return FAQ_ITEMS[4];
    return null;
  }, [draft]);

  return (
    <div className="v4">
      <div className={"v4-hero " + (hero === "bleed" ? "hero-bleed" : "")}>
        <div className="v4-hero-inner col gap-4 center" style={{textAlign: "center"}}>
          <span className="row gap-2 center"><Avatars count={4}/>&nbsp;<span className="muted" style={{fontSize: 13}}>4 humans on the support desk right now</span></span>
          <h1 className="v4-title">Hi — what's on your mind?</h1>
          <p className="v4-tagline">Type below. We'll try to answer instantly. If we can't, the message lands in our inbox and a real person replies within 4 hours.</p>
          <div className="row gap-2 wrap center" style={{justifyContent: "center"}}>
            <StatusPill/>
            <span className="pill"><Icon.globe/> EN · RU · ES · FR · BY</span>
          </div>
        </div>
      </div>

      <div className="glass v4-composer">
        {submitted ? (
          <div className="v4-success col gap-3 center">
            <div className="v4-burst">✓</div>
            <h3 style={{fontSize: 20}}>Sent — we're on it.</h3>
            <p className="muted">Reply lands at your email within 4 hours.</p>
            <button className="btn" onClick={() => { setSubmitted(false); setDraft(""); }}>Send another</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="col gap-4">
            <div className="row gap-3 wrap">
              <div className="col" style={{flex: 1, minWidth: 220}}>
                <label className="label" htmlFor="v4-name">Your name</label>
                <input id="v4-name" className="input" placeholder="Player name" required/>
              </div>
              <div className="col" style={{flex: 1, minWidth: 220}}>
                <label className="label" htmlFor="v4-email">Email</label>
                <input id="v4-email" type="email" className="input" placeholder="you@email.com" required/>
              </div>
            </div>
            <div className="col">
              <label className="label" htmlFor="v4-subject">Subject</label>
              <input id="v4-subject" className="input" placeholder="One line summary" required/>
            </div>
            <div className="col">
              <label className="label" htmlFor="v4-message">Tell us what's going on</label>
              <textarea
                id="v4-message"
                className="textarea v4-textarea"
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Try: 'I was charged twice for the season pass'"
                required
              />
              {suggestion && (
                <div className="suggest">
                  <Icon.spark/>
                  <div className="col gap-1">
                    <span className="lab">We may already have an answer</span>
                    <strong style={{fontSize: 14}}>{suggestion.q}</strong>
                    <span className="muted" style={{fontSize: 13.5, marginTop: 4}}>{suggestion.a}</span>
                    <a href="#" style={{color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 6}}>Open in help center →</a>
                  </div>
                </div>
              )}
            </div>
            <div className="row between center wrap gap-3">
              <span className="muted row center gap-2" style={{fontSize: 12.5}}>
                <Icon.clock/> Median reply 4 hrs · we're <strong style={{color: "var(--color)", fontWeight: 600}}>online</strong>
              </span>
              <button type="submit" className="btn btn-primary"><Icon.send/> Send</button>
            </div>
          </form>
        )}
      </div>

      <div className="v4-channels">
        <span className="label" style={{textAlign: "center", display: "block", marginBottom: 12}}>Or reach us where you are</span>
        <div className="row gap-3 wrap center" style={{justifyContent: "center"}}>
          {CHANNELS.slice(0, 5).map(c => (
            <a key={c.key} className="v4-chip" href="#" title={c.title}>
              <span style={{color: c.accent}}>{c.icon}</span>
              <span>{c.title}</span>
            </a>
          ))}
        </div>
      </div>

      {showFAQ && (
        <div className="glass v4-faq">
          <div className="row center gap-2" style={{marginBottom: 8}}>
            <Icon.search/>
            <h2 style={{fontSize: 20}}>Quick answers</h2>
          </div>
          <Accordion items={FAQ_ITEMS}/>
        </div>
      )}

      {showStats && (
        <div className="v4-footer-stats">
          <span className="muted">arcadeum.care@gmail.com</span>
          <span className="muted">·</span>
          <span className="muted">Mon – Fri, 10:00 – 18:00 (GMT+4)</span>
          <span className="muted">·</span>
          <span className="muted row center gap-2"><span className="dot" style={{width: 8, height: 8, borderRadius: 999, background: "#10b981", display: "inline-block"}}/> All systems operational</span>
        </div>
      )}
    </div>
  );
}

window.Variation4 = Variation4;
