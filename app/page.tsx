import Footer from './components/Footer';

import Navbar from './components/Navbar';

const exams = ["UPSC CSE", "SSC CGL", "Banking", "Railways", "State PSC", "Defence"];

export default function Home() {
  return (
    <main>
      <Navbar />

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span>✦</span> INDIA&apos;S AI-ENABLED EXAM COMPANION</div>
          <h1>Your strategy.<br /><em>Smarter every day.</em></h1>
          <p className="hero-lead">One intelligent preparation system that understands your exam, your pace, and your gaps-then turns every study hour into measurable progress.</p>
          <div className="hero-actions">
            <a className="button" href="/dashboard">Build my free study plan <span>→</span></a>
            <a className="watch-link" href="#features"><span className="play">▶</span> See how Yukti works</a>
          </div>
          <div className="trust-row">
            <div className="avatars"><span>AR</span><span>SK</span><span>NM</span><span>VP</span></div>
            <p><strong>4.9/5</strong> from early learners<br /><span>Designed for every corner of Bharat</span></p>
          </div>
        </div>

        <div className="hero-visual" aria-label="YuktiPrep learning dashboard preview">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="dashboard-card">
            <div className="dash-top"><div><small>GOOD MORNING, ASPIRANT</small><h3>Today&apos;s focus</h3></div><span className="streak">🔥 12 day streak</span></div>
            <div className="plan-card">
              <div className="plan-icon">⌁</div><div><small>AI RECOMMENDATION</small><strong>Indian Polity: Fundamental Rights</strong><p>42 min · Revision priority: High</p></div><button aria-label="Start lesson">→</button>
            </div>
            <div className="mini-grid">
              <div><span className="ring">78<small>%</small></span><p>Syllabus covered</p></div>
              <div className="bars"><p>This week</p><i style={{ height: '42%' }}></i><i style={{ height: '68%' }}></i><i style={{ height: '52%' }}></i><i style={{ height: '88%' }}></i><i style={{ height: '72%' }}></i><i className="active" style={{ height: '96%' }}></i><i style={{ height: '64%' }}></i></div>
            </div>
          </div>
          <div className="float-card float-one"><span>↗</span><div><strong>+18%</strong><small>Mock score</small></div></div>
          <div className="float-card float-two"><span>✓</span><div><strong>Current affairs</strong><small>Mapped to your syllabus</small></div></div>
        </div>
      </section>

      <section className="exam-strip" id="exams"><p>ONE PLATFORM. EVERY AMBITION.</p><div>{exams.map((exam, i) => <span key={exam}><b>{['◎', '◇', '▦', '⇄', '♜', '✦'][i]}</b>{exam}</span>)}</div></section>

      <section className="promise" id="features">
        <div className="section-kicker">PREPARATION WITH PURPOSE</div>
        <h2>Not more content.<br /><em>The right next step.</em></h2>
        <p>YuktiPrep connects your syllabus, performance and available time into one living plan-so you always know what matters now.</p>
        <div className="feature-grid">
          <article className="feature featured"><div className="feature-num">01</div><div className="feature-icon">⌁</div><h3>Yukti AI Study Path</h3><p>A daily plan that recalibrates after every test, revision and missed session.</p><a href="/dashboard">Explore your path →</a></article>
          <article className="feature"><div className="feature-num">02</div><div className="feature-icon">◷</div><h3>Revision Intelligence</h3><p>Recall-based revision nudges surface the right topic before you forget it.</p><a href="/dashboard">See smart revision →</a></article>
          <article className="feature"><div className="feature-num">03</div><div className="feature-icon">◉</div><h3>Mock-to-Mastery</h3><p>Every wrong answer becomes a focused improvement plan, not just a score.</p><a href="/dashboard">Try a diagnostic →</a></article>
          <article className="feature"><div className="feature-num">04</div><div className="feature-icon">✧</div><h3>Current Affairs, Mapped</h3><p>Verified daily updates connected directly to syllabus topics and PYQs.</p><a href="/current-affairs">Read today&apos;s brief →</a></article>
        </div>
      </section>

      <section className="bharat" id="mentors"><div><span className="section-kicker light">BUILT FOR BHARAT</span><h2>Big ambition lives<br />everywhere.</h2><p>Low-data learning, regional exam depth, bilingual support and downloadable study packs make serious preparation accessible beyond metro cities.</p><div className="bharat-stats"><span><strong>12+</strong> exam families</span><span><strong>8</strong> regional tracks</span><span><strong>24×7</strong> AI guidance</span></div></div><div className="quote"><div className="quote-mark">“</div><p>Yukti does not ask where you come from. It asks where you want to go-and builds the road with you.</p><span>THE YUKTIPREP PROMISE</span></div></section>

      <section className="cta" id="pricing"><span className="section-kicker">YOUR ATTEMPT DESERVES A STRATEGY</span><h2>Begin with clarity.<br /><em>Prepare with Yukti.</em></h2><p>Take a free 7-minute diagnostic and receive your personalised starting plan.</p><a className="button" href="/dashboard">Start free diagnostic →</a><small>No credit card · Free plan available · Upgrade anytime</small></section>

      <Footer />
    </main>
  );
}
