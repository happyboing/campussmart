import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
} from 'lucide-react';
import { useApp, isBoostActive } from '../store';
import { CATEGORIES } from '../data/catalog';
import { greeting } from '../lib/format';
import { ProductCard, SectionHead, VerifiedMark } from '../components/ui';
import { Reveal } from '../components/motion';
import { CartButton, NotificationBell } from '../components/layout';
import { Wordmark } from '../components/ui';

export function HomeScreen() {
  const navigate = useNavigate();
  const { currentUser, state } = useApp();
  const [query, setQuery] = useState('');

  const available = state.listings.filter((l) => l.available);
  const boosted = available
    .filter(isBoostActive)
    .sort((a, b) => +new Date(b.boostedUntil ?? 0) - +new Date(a.boostedUntil ?? 0));
  const fresh = [...available]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 8);

  const activeOrder = state.orders
    .filter(
      (o) =>
        o.buyerId === currentUser?.id && (o.status === 'pending' || o.status === 'confirmed'),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

  const countFor = (id: string) => available.filter((l) => l.category === id).length;

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : '/explore');
  };

  return (
    <div className="screen">
      <header className="home-header" style={{ paddingTop: 16 }}>
        <div className="row" style={{ gap: 9 }}>
          <Wordmark />
        </div>
        <div className="row" style={{ gap: 2 }}>
          <NotificationBell />
          <CartButton />
        </div>
      </header>

      <div style={{ padding: '2px 20px 12px' }}>
        <div className="row">
          <span className="campus-pill">
            <MapPin size={11} /> MMCL · Cabuyao
          </span>
          <span
            className="badge teal"
            style={{ height: 24, gap: 4, fontSize: 9.5 }}
          >
            <ShieldCheck size={10} /> Verified campus
          </span>
        </div>
        <div className="home-greeting" style={{ marginTop: 11 }}>
          <span className="eyebrow">{greeting()} · Ready to trade?</span>
          <h1>
            {currentUser?.name.split(' ')[0]}, your campus is{' '}
            <span style={{ color: 'var(--navy-500)' }}>open.</span>
          </h1>
        </div>
      </div>

      <form className="search-bar" onSubmit={goSearch}>
        <Search size={18} />
        <input
          placeholder="Search textbooks, calculators, snacks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the marketplace"
        />
        <button
          type="button"
          className="filter-btn"
          aria-label="Open filters"
          onClick={() => navigate('/explore')}
        >
          <SlidersHorizontal size={15} />
        </button>
      </form>

      <section className="hero">
        <span className="hero-tag">
          <Sparkles size={11} /> Student entrepreneurship
        </span>
        <h2>Turn last sem's books into this sem's budget.</h2>
        <p>Free listings. 5% only when you complete a sale. Meet safely on campus.</p>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn gold sm" onClick={() => navigate('/sell')}>
            Start selling <ArrowRight size={14} />
          </button>
          <button className="btn white sm" onClick={() => navigate('/explore')}>
            Browse deals
          </button>
        </div>
      </section>

      <Reveal>
        <SectionHead
          title="Shop by category"
          action="See all"
          onAction={() => navigate('/explore')}
        />
        <div className="cat-grid">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className="cat-tile"
                onClick={() => navigate(`/explore?category=${cat.id}`)}
              >
                <span className={`cat-icon ${cat.tone}`}>
                  <Icon size={18} />
                </span>
                <span className="name">{cat.short}</span>
                <span className="count">{countFor(cat.id)} listings</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      {activeOrder && (
        <button
          className="card"
          style={{
            margin: '18px 20px 0',
            padding: 13,
            display: 'flex',
            gap: 11,
            alignItems: 'center',
            width: 'calc(100% - 40px)',
            textAlign: 'left',
          }}
          onClick={() => navigate(`/order/${activeOrder.id}`)}
        >
          <img
            src={activeOrder.lines[0]?.image}
            alt=""
            style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }}
          />
          <div className="grow">
            <div className="row" style={{ gap: 5 }}>
              <span className={`badge ${activeOrder.status === 'pending' ? 'gold' : 'blue'}`}>
                {activeOrder.status === 'pending' ? 'Awaiting seller' : 'Confirmed'}
              </span>
              <span className="tiny muted">Order update</span>
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                marginTop: 3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 230,
              }}
            >
              {activeOrder.lines[0]?.title}
            </div>
          </div>
          <ChevronRight size={17} style={{ color: 'var(--muted-2)' }} />
        </button>
      )}

      {boosted.length > 0 && (
        <Reveal style={{ marginTop: 22 }}>
          <SectionHead
            title="Boosted on campus"
            action="View all"
            onAction={() => navigate('/explore?sort=boosted')}
          />
          <div className="scroll-x">
            {boosted.map((l) => (
              <ProductCard key={l.id} listing={l} horizontal />
            ))}
          </div>
          <p className="tiny muted" style={{ padding: '2px 20px 0' }}>
            Paid promotions. Boosted listings get extra visibility, not a guaranteed sale.
          </p>
        </Reveal>
      )}

      <Reveal style={{ marginTop: 22 }} delay={40}>
        <SectionHead
          title="Fresh on campus"
          action="See all"
          onAction={() => navigate('/explore')}
        />
        <div className="grid-2" style={{ padding: '0 20px' }}>
          {fresh.map((l) => (
            <ProductCard key={l.id} listing={l} />
          ))}
        </div>
      </Reveal>

      <Reveal style={{ marginTop: 22 }} delay={60}>
        <SectionHead title="Meet smart, meet safe" />
        <div className="safe-strip">
          <span className="icon">
            <ShieldCheck size={17} />
          </span>
          <div>
            <p>
              <strong>Safe Campus Meetup Spots</strong>
              Use the ET Yuchengco lobby, Library entrance, or Student Lounge. These areas are
              well-lit and monitored by campus security.
            </p>
            <button
              className="link"
              style={{ marginTop: 5, fontSize: 10.5 }}
              onClick={() => navigate('/policies/meetups')}
            >
              See meetup guidelines <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal style={{ marginTop: 18, padding: '0 20px' }} delay={80}>
        <button
          className="card pad"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textAlign: 'left',
          }}
          onClick={() => navigate('/seller')}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'var(--navy-800)',
              color: '#f7ebc6',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <Store size={18} />
          </span>
          <span className="grow">
            <span style={{ fontSize: 12.5, fontWeight: 750, display: 'block' }}>
              Seller Center
            </span>
            <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>
              Manage listings, orders, and post boosts
            </span>
          </span>
          <ChevronRight size={17} style={{ color: 'var(--muted-2)' }} />
        </button>
      </Reveal>

      <div
        className="row"
        style={{ justifyContent: 'center', gap: 6, padding: '22px 20px 8px' }}
      >
        <VerifiedMark />
        <span className="tiny muted">
          Built for the Mapúa Malayan Colleges Laguna community
        </span>
      </div>
    </div>
  );
}
