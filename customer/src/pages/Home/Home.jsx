import SearchBox from "../../components/SearchBox/SearchBox";
import heroBusImg from "../../assets/hero-bus.jpg";
import homeHeroImg from "../../assets/home-hero.png";
import { ArrowRight, BusFront, CalendarDays, Check, Crown, Gift, MapPin, ShieldCheck, Smartphone, Ticket, Users, WalletCards } from "lucide-react";
import "./Home.css";

const routes = [["Delhi", "Jaipur", "₹299"], ["Delhi", "Dehradun", "₹399"], ["Mumbai", "Pune", "₹250"], ["Bangalore", "Chennai", "₹699"]];
const destinations = ["Lonavala", "Mahabaleshwar", "Panchgani", "Goa", "Ooty", "Manali"];

function SectionHeading({ eyebrow, title, action }) {
  return <div className="home-section-heading"><div><div className="section-eyebrow"><span />{eyebrow}</div><h2>{title}</h2></div>{action && <button className="outline-action">{action}<ArrowRight size={15} /></button>}</div>;
}

function Home() {
  return <main className="home-page">
    <section className="home-hero" style={{ backgroundImage: `url(${homeHeroImg})` }}><div className="hero-shade" /><div className="home-container hero-inner">
      <div className="hero-copy"><div className="smart-pill"><BusFront size={15} /> INDIA&apos;S SMART BUS TRAVEL</div><h1>Explore India<br />With <em>AIBUS</em></h1><div className="hero-rule" /><div className="hero-points"><span><Check />Verified<br />Operators</span><span><Ticket />Live Seat<br />Availability</span><span><CalendarDays />Instant<br />Booking</span><span><WalletCards />24/7<br />Support</span></div></div>
      <div className="hero-search-wrap"><SearchBox /></div>
    </div></section>
    <section className="benefits-strip"><div className="home-container benefits-inner"><span><i>♟</i><b>Live Seat Availability</b></span><span><i><ShieldCheck /></i><b>Secure Payments</b></span><span><i><Ticket /></i><b>Instant Ticket Booking</b></span><span><i><Users /></i><b>Verified Operators</b></span></div></section>
    <section className="home-content home-container" id="offers-and-more">
      <SectionHeading eyebrow="POPULAR ROUTES" title="Top Routes" action="View All Routes" /><div className="route-grid">{routes.map(([from, to, price], index) => <article className="route-card" key={from + to}><div className={`route-image route-image-${index}`} style={{ backgroundImage: `url(${index % 2 === 0 ? homeHeroImg : heroBusImg})` }} /><div className="route-info"><strong>{from} <span>→</span> {to}</strong><b>From {price}</b><button aria-label={`Search ${from} to ${to}`}><ArrowRight size={17} /></button></div></article>)}</div>
      <SectionHeading eyebrow="EXPLORE DESTINATIONS" title="Popular Destinations" action="View All Destinations" /><div className="destination-grid">{destinations.map((name, index) => <article className={`destination-card destination-${index}`} key={name} style={{ backgroundImage: `url(${index % 2 === 0 ? heroBusImg : homeHeroImg})` }}><span><MapPin size={13} />{name}</span><b>→</b></article>)}</div>
      <section className="why-section"><div className="why-copy"><div className="section-eyebrow"><span />WHY CHOOSE AIBUS</div><h2>Smart Travel<br />For Every Journey</h2><div className="why-points"><span><i><Ticket /></i>Wide Network</span><span><i><ShieldCheck /></i>Trusted Operators</span><span><i><MapPin /></i>Real-Time Tracking</span><span><i><CalendarDays /></i>Easy Cancellations</span></div></div><div className="why-visual" style={{ backgroundImage: `url(${heroBusImg})` }}><div><Crown size={16} /> Travel<br />Comfortably</div></div></section>
      <section className="coupon-banner"><div className="coupon-icon"><Gift /></div><div><strong>Flat ₹100 OFF</strong><span>On all bus bookings</span></div><div className="coupon-code"><span>Use Code</span><b>AIBUS100</b><button aria-label="Copy coupon code">▣</button></div><button className="dark-action">Book Now <ArrowRight size={17} /></button></section>
      <section className="app-promo"><div><h2>Take <em>AIBUS</em> Anywhere</h2><p>Book, track and manage your bookings on the go.</p><div className="store-buttons"><span>▶ <small>GET IT ON</small><b>Google Play</b></span><span>● <small>Download on the</small><b>App Store</b></span></div></div><div className="phone-art"><Smartphone size={130} /><div><BusFront /><b><em>AI</em>BUS</b></div></div></section>
    </section>
  </main>;
}
export default Home;
