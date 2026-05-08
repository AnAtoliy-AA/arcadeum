/* Variation 1 — Refined (Default dark)
   Two-column form/info, accordion FAQ, response-time strip. Closest to current shipped page. */

function Variation1({ layout = "two", showFAQ = true, showStats = true, hero = "minimal" }) {
  const [submitted, setSubmitted] = React.useState(false);
  const onSubmit = (e) => { e.preventDefault(); setSubmitted(true); };
  const formColClass = layout === "two" ? "v1-form two" : "v1-form one";

  return (
    <div className="v1">
      <div className={"v1-hero " + (hero === "bleed" ? "hero-bleed" : "")}>
        <div className="row between center wrap" style={{gap: 16}}>
          <div className="col gap-2">
            <span className="label">Support</span>
            <h1 className="v1-title">Talk to the Arcadeum team</h1>
            <p className="v1-tagline muted">Real humans, fast replies. Pick a channel — or send a message and we'll route it for you.</p>
          </div>
          <div className="col gap-2" style={{alignItems: "flex-end"}}>
            <StatusPill/>
            <span className="row gap-2 center muted" style={{fontSize: 13}}>
              <Icon.globe/> EN · RU · ES · FR · BY
            </span>
          </div>
        </div>
      </div>

      {showStats && (
        <div className="stats">
          <div className="stat"><span className="num">~ 4 hrs</span><span className="lbl">Median first reply</span></div>
          <div className="stat"><span className="num">98%</span><span className="lbl">Resolved &lt; 24 hrs</span></div>
          <div className="stat"><span className="num">24 / 7</span><span className="lbl">Discord moderation</span></div>
        </div>
      )}

      <div className={formColClass}>
        <div className="glass v1-form-card">
          <div className="row between center" style={{marginBottom: 18}}>
            <h2 style={{fontSize: 22}}>Send us a message</h2>
            <span className="row gap-2 center muted" style={{fontSize: 13}}>
              <Avatars count={3}/>&nbsp; Team online
            </span>
          </div>
          {submitted ? (
            <div className="v1-success">
              <div className="v1-success-mark">✓</div>
              <h3 style={{fontSize: 18, marginBottom: 6}}>Message received</h3>
              <p className="muted">We'll reply to you within 4 hours during working hours.</p>
              <button className="btn" onClick={() => setSubmitted(false)} style={{marginTop: 16}}>Send another</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="col gap-5">
              <div className={layout === "two" ? "row gap-4 wrap v1-grid-two" : "col gap-5"}>
                <div className="col" style={{flex: 1, minWidth: 200}}>
                  <label className="label" htmlFor="v1-name">Your name</label>
                  <input id="v1-name" className="input" placeholder="Anatoliy K." required/>
                </div>
                <div className="col" style={{flex: 1, minWidth: 200}}>
                  <label className="label" htmlFor="v1-email">Email</label>
                  <input id="v1-email" type="email" className="input" placeholder="you@email.com" required/>
                </div>
              </div>
              <div className="col">
                <label className="label" htmlFor="v1-subject">Subject</label>
                <input id="v1-subject" className="input" placeholder="What's it about?" required/>
              </div>
              <div className="col">
                <label className="label" htmlFor="v1-message">Message</label>
                <textarea id="v1-message" className="textarea" rows={6} placeholder="Tell us what's going on…" required/>
              </div>
              <div className="row between center wrap gap-3">
                <span className="muted" style={{fontSize: 12.5}}>By sending you agree to our privacy policy.</span>
                <button type="submit" className="btn btn-primary"><Icon.send/> Send message</button>
              </div>
            </form>
          )}
        </div>

        {layout === "two" && (
          <aside className="col gap-4 v1-side">
            <div className="glass v1-info">
              <span className="label">Email</span>
              <a href="mailto:arcadeum.care@gmail.com" className="strong" style={{fontWeight: 600}}>arcadeum.care@gmail.com</a>
              <p className="muted" style={{marginTop: 6, fontSize: 13.5}}>For account, billing, and serious bugs.</p>
            </div>
            <div className="glass v1-info">
              <span className="label">Working hours</span>
              <span className="strong" style={{fontWeight: 600}}>Mon – Fri, 10:00 – 18:00</span>
              <p className="muted" style={{marginTop: 6, fontSize: 13.5}}>GMT+4 · Discord mods are 24/7.</p>
            </div>
            <div className="glass v1-info">
              <span className="label">Faster channels</span>
              <div className="col gap-2" style={{marginTop: 6}}>
                <a className="row center gap-2" href="#"><Icon.discord/><span>Discord</span></a>
                <a className="row center gap-2" href="#"><Icon.twitter/><span>@arcadeum</span></a>
                <a className="row center gap-2" href="#"><Icon.github/><span>GitHub Issues</span></a>
              </div>
            </div>
          </aside>
        )}
      </div>

      {showFAQ && (
        <div className="glass v1-faq">
          <div className="row between center" style={{marginBottom: 8}}>
            <h2 style={{fontSize: 22}}>Frequently asked</h2>
            <a className="muted" style={{fontSize: 13}} href="#">Browse all 120 →</a>
          </div>
          <Accordion items={FAQ_ITEMS}/>
        </div>
      )}
    </div>
  );
}

window.Variation1 = Variation1;
