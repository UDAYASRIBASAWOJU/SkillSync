import { Link } from 'react-router-dom';
import logo from '../assets/skillsync-logo.png';
import ThemeToggleButton from '../components/ui/ThemeToggleButton';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="ppt-page" id="top">
      <div className="ppt-grid-overlay" aria-hidden="true" />
      <div className="ppt-aura aura-one" aria-hidden="true" />
      <div className="ppt-aura aura-two" aria-hidden="true" />
      <div className="ppt-aura aura-three" aria-hidden="true" />

      {/* ── Navbar ── */}
      <header className="ppt-nav">
        <a className="ppt-brand" href="#top" aria-label="SkillSync Home">
          <img src={logo} alt="SkillSync logo" className="ppt-logo" />
          <span>SkillSync</span>
        </a>

        <div className="ppt-nav-actions">
          <ThemeToggleButton className="ppt-theme-toggle" showLabel={false} />
          <Link className="ppt-btn ghost" to="/register">
            Register
          </Link>
          <Link className="ppt-btn solid" to="/login">
            Sign In
          </Link>
        </div>
      </header>

      {/* ── Full-screen Hero ── */}
      <main className="ss-hero-main">
        <section className="ss-hero-card">
          <div className="hero-aura hero-aura-one" aria-hidden="true" />
          <div className="hero-aura hero-aura-two" aria-hidden="true" />
          <div className="hero-aura hero-aura-three" aria-hidden="true" />

          {/* Orbiting logo stage */}
          <div className="brand-stage" aria-hidden="true">
            <div className="gravity-orb orb-a" />
            <div className="gravity-orb orb-b" />
            <div className="gravity-orb orb-c" />
            <img src={logo} alt="" className="hero-logo" />
          </div>

          <h1 className="hero-brand-title">SkillSync</h1>
          <p className="hero-tagline">Peer To Peer Learning Platform</p>

          <div className="hero-cta-row">
            <Link className="landing-btn landing-btn-solid" to="/dashboard">
              Get Started
            </Link>
            <Link className="landing-btn landing-btn-ghost" to="/register">
              Register
            </Link>
            <Link className="landing-btn landing-btn-ghost" to="/login">
              Sign In
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
