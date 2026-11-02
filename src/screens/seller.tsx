import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarClock,
  Check,
  ChevronRight,
  Flag,
  MapPin,
  MessageCircle,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useApp, isBoostActive } from '../store';
import {
  Avatar,
  EmptyState,
  FloatingBar,
  PageHeader,
  ProductCard,
  Sheet,
  useToast,
} from '../components/ui';
import { ReportSheet } from '../components/ReportSheet';
import { CountUp } from '../components/motion';
import { BOOST_PACKAGES, SAFE_SPOTS } from '../data/catalog';
import { dayMonth, peso, shortDate, timeAgo } from '../lib/format';
import type { PaymentMethod } from '../types';

/* ------------------------------------------------------------------ public seller */

export function SellerProfileScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, currentUser, startConversationWith } = useApp();
  const [tab, setTab] = useState<'listings' | 'reviews'>('listings');
  const [reportOpen, setReportOpen] = useState(false);

  const seller = state.users.find((u) => u.id === id);
  if (!seller) {
    return (
      <div className="screen">
        <PageHeader title="Seller" />
        <EmptyState
          icon={<Store size={30} />}
          title="Seller not found"
          body="This account may no longer be available."
          action="Back to Explore"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const listings = state.listings.filter((l) => l.sellerId === seller.id);
  const available = listings.filter((l) => l.available);
  const reviews = state.reviews
    .filter((r) => r.sellerId === seller.id)
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));
  const sold = state.orders.filter(
    (o) => o.sellerId === seller.id && o.status === 'completed',
  ).length;
  const isOwn = currentUser?.id === seller.id;
  const spots = [...new Set(listings.flatMap((l) => l.meetupSpots))];

  const message = () => {
    const cid = startConversationWith(seller.id, available[0]?.id);
    if (cid) navigate(`/chat/${cid}`);
  };

  return (
    <div className="screen flush">
      <div
        style={{
          background:
            'radial-gradient(260px 190px at 88% 0%, rgba(45,47,191,0.22), transparent 70%), linear-gradient(150deg, #2d2fbf, #1b1c5a)',
          color: '#fff',
          padding: '14px 18px 20px',
          borderRadius: '0 0 30px 30px',
          position: 'relative',
        }}
      >
        <div className="row between" style={{ position: 'relative', zIndex: 2 }}>
          <button
            className="icon-btn light"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{ marginLeft: -8 }}
          >
            <ChevronRight size={19} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className="row" style={{ gap: 2 }}>
            {isOwn ? (
              <button className="btn sm white" onClick={() => navigate('/profile')}>
                Edit profile
              </button>
            ) : (
              <button
                className="icon-btn light"
                onClick={() => setReportOpen(true)}
                aria-label="Report seller"
              >
                <Flag size={17} />
              </button>
            )}
          </div>
        </div>

        <div className="row" style={{ gap: 13, marginTop: 14, position: 'relative', zIndex: 2 }}>
          <Avatar user={seller} size="xl" online />
          <div className="grow">
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.2 }}>
              {seller.name}
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.58)', marginTop: 3 }}>
              {seller.department}
            </div>
            <div className="row wrap" style={{ gap: 5, marginTop: 7 }}>
              <span className="badge" style={{ background: 'rgba(45,47,191,0.16)', color: '#f7ebc6' }}>
                <ShieldCheck size={10} /> Verified
              </span>
              {seller.badge && (
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.68)' }}>
                  {seller.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="row" style={{ gap: 14, marginTop: 15, position: 'relative', zIndex: 2 }}>
          <span className="row" style={{ gap: 4, fontSize: 11 }}>
            <Star size={13} style={{ fill: 'var(--gold-400)', color: 'var(--gold-400)' }} />
            <strong>{seller.rating ? seller.rating.toFixed(1) : 'New'}</strong>
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>({seller.reviewCount})</span>
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
            {available.length} active listings
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{sold} completed</span>
        </div>

        {seller.bio && (
          <p
            style={{
              marginTop: 13,
              fontSize: 11.5,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.62)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {seller.bio}
          </p>
        )}

        {!isOwn && (
          <button className="btn gold block" style={{ marginTop: 14 }} onClick={message}>
            <MessageCircle size={16} /> Message {seller.name.split(' ')[0]}
          </button>
        )}
      </div>

      <div className="page" style={{ paddingTop: 16 }}>
        <div className="row between" style={{ marginBottom: 10 }}>
          <div className="row" style={{ gap: 5 }}>
            <MapPin size={12} style={{ color: 'var(--teal-600)' }} />
            <span className="tiny muted">
              Usually meets at{' '}
              {spots
                .map((s) => {
                  const name = SAFE_SPOTS.find((x) => x.id === s)?.name ?? 'Campus';
                  return name.replace(' Building Lobby', ' Lobby').replace(' Entrance', '');
                })
                .slice(0, 2)
                .join(' & ')}
            </span>
          </div>
          <span className="tiny muted">Joined {shortDate(seller.joined)}</span>
        </div>

        <div className="segmented" style={{ marginBottom: 14 }}>
          <button
            className={tab === 'listings' ? 'active' : ''}
            onClick={() => setTab('listings')}
          >
            Listings ({available.length})
          </button>
          <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
            Reviews ({reviews.length})
          </button>
        </div>

        {tab === 'listings' ? (
          available.length ? (
            <div className="grid-2">
              {available.map((l) => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Package size={30} />}
              title="No active listings"
              body="This seller has no available items right now. Check back soon."
              action="Explore others"
              onAction={() => navigate('/explore')}
            />
          )
        ) : reviews.length ? (
          <div className="col" style={{ gap: 9 }}>
            {reviews.map((r) => {
              const buyer = state.users.find((u) => u.id === r.buyerId);
              return (
                <div className="card pad" key={r.id}>
                  <div className="row" style={{ gap: 9 }}>
                    {buyer && <Avatar user={buyer} size="sm" />}
                    <div className="grow">
                      <div style={{ fontSize: 12, fontWeight: 750 }}>{buyer?.name ?? 'Buyer'}</div>
                      <div className="tiny muted">{dayMonth(r.at)}</div>
                    </div>
                    <span className="stars row" style={{ gap: 1 }}>
                      {Array.from({ length: r.stars }).map((_, i) => (
                        <Star key={i} size={11} />
                      ))}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: 11.5, lineHeight: 1.55, marginTop: 8, color: 'var(--ink-2)' }}>
                      “{r.comment}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Star size={30} />}
            title="No reviews yet"
            body="Reviews appear after a completed transaction."
          />
        )}

        <div className="inset" style={{ marginTop: 18 }}>
          <div className="row start" style={{ gap: 8 }}>
            <ShieldCheck size={14} style={{ color: 'var(--teal-600)', marginTop: 1, flex: '0 0 auto' }} />
            <p className="tiny muted" style={{ lineHeight: 1.55 }}>
              CampuSmart verified this member through their @mcl.edu.ph email. Sellers are
              responsible for accurate descriptions and disclosures. Always inspect items at a safe
              campus meetup.
            </p>
          </div>
        </div>
      </div>

      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetUserId={seller.id}
        targetName={seller.name}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ seller center */

export function SellerCenterScreen() {
  const navigate = useNavigate();
  const { state, currentUser, updateListing, deleteListing } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState<'listings' | 'orders' | 'boosts'>('listings');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!currentUser) return null;

  const listings = state.listings.filter((l) => l.sellerId === currentUser.id);
  const sales = state.orders
    .filter((o) => o.sellerId === currentUser.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const completed = sales.filter((o) => o.status === 'completed');
  const earnings = completed.reduce((sum, o) => sum + (o.subtotal - o.commission), 0);
  const boosts = state.boosts
    .filter((b) => b.sellerId === currentUser.id)
    .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt));
  const boostSpend = boosts.reduce((sum, b) => sum + b.amount, 0);
  const target = listings.find((l) => l.id === deleteTarget);

  return (
    <div className="screen">
      <PageHeader
        title="Seller Center"
        subtitle="Your campus storefront"
        backTo="/profile"
        right={
          <button className="icon-btn" onClick={() => navigate('/sell')} aria-label="Add listing">
            <Plus size={20} />
          </button>
        }
      />

      <div className="page tight" style={{ paddingTop: 8 }}>
        <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="stat-card">
            <div className="k">Active listings</div>
            <div className="v">
              <CountUp value={listings.filter((l) => l.available).length} />
            </div>
            <div className="d">{listings.length} total</div>
          </div>
          <div className="stat-card">
            <div className="k">Completed sales</div>
            <div className="v">
              <CountUp value={completed.length} />
            </div>
            <div className="d">{sales.filter((o) => o.status === 'pending').length} pending</div>
          </div>
          <div className="stat-card dark">
            <div className="k">Net earnings</div>
            <div className="v">
              <CountUp value={earnings} prefix="₱" />
            </div>
            <div className="d">After 5% commission</div>
          </div>
          <div className="stat-card">
            <div className="k">Boost spend</div>
            <div className="v">
              <CountUp value={boostSpend} prefix="₱" />
            </div>
            <div className="d">{boosts.length} promotion{boosts.length === 1 ? '' : 's'}</div>
          </div>
        </div>

        <div className="row" style={{ gap: 6, marginTop: 10 }}>
          <span className="badge gold">
            <Sparkles size={10} /> Boosts start at ₱50/day
          </span>
          <span className="badge outline">Free basic listings</span>
        </div>

        <div className="segmented" style={{ marginTop: 14 }}>
          <button className={tab === 'listings' ? 'active' : ''} onClick={() => setTab('listings')}>
            Listings
          </button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
            Orders
          </button>
          <button className={tab === 'boosts' ? 'active' : ''} onClick={() => setTab('boosts')}>
            Boosts
          </button>
        </div>

        {tab === 'listings' && (
          <div style={{ marginTop: 12 }}>
            <button className="btn gold block" onClick={() => navigate('/sell')}>
              <PackagePlus size={16} /> Create a new listing
            </button>
            {listings.length === 0 ? (
              <EmptyState
                icon={<Store size={30} />}
                title="Your storefront is empty"
                body="List a textbook, calculator, uniform, or snack. Basic listings are free."
                action="Create your first listing"
                onAction={() => navigate('/sell')}
              />
            ) : (
              <div className="card pad" style={{ marginTop: 12, paddingTop: 4, paddingBottom: 4 }}>
                {listings.map((l) => {
                  const boosted = isBoostActive(l);
                  return (
                    <div className="mini-listing" key={l.id}>
                      <img src={l.image} alt="" />
                      <div className="grow">
                        <button
                          onClick={() => navigate(`/product/${l.id}`)}
                          style={{ textAlign: 'left' }}
                        >
                          <div className="t">{l.title}</div>
                        </button>
                        <div className="p">
                          {l.type === 'rent'
                            ? `${peso(l.rentalPerDay ?? 0)}/day`
                            : l.type === 'borrow'
                              ? 'Free'
                              : peso(l.price)}
                        </div>
                        <div className="meta row" style={{ gap: 4 }}>
                          {boosted ? (
                            <span className="badge gold" style={{ height: 17, padding: '0 5px', fontSize: 8 }}>
                              <Sparkles size={8} /> Boosted
                            </span>
                          ) : (
                            <span className={`badge ${l.available ? 'green' : 'gray'}`} style={{ height: 17, padding: '0 5px', fontSize: 8 }}>
                              {l.available ? 'Live' : 'Hidden'}
                            </span>
                          )}
                          <span>{l.views} views</span>
                        </div>
                      </div>
                      <div className="col" style={{ gap: 4, alignItems: 'flex-end' }}>
                        <div className="row" style={{ gap: 2 }}>
                          <button
                            className="icon-btn"
                            style={{ width: 30, height: 30 }}
                            onClick={() => navigate(`/sell?edit=${l.id}`)}
                            aria-label="Edit listing"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="icon-btn"
                            style={{ width: 30, height: 30 }}
                            onClick={() => navigate(`/boost/${l.id}`)}
                            aria-label="Boost listing"
                          >
                            <Sparkles size={14} />
                          </button>
                          <button
                            className="icon-btn"
                            style={{ width: 30, height: 30, color: 'var(--danger)' }}
                            onClick={() => setDeleteTarget(l.id)}
                            aria-label="Delete listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <button
                          className={`switch ${l.available ? 'on' : ''}`}
                          style={{ transform: 'scale(0.76)', transformOrigin: 'right' }}
                          onClick={() =>
                            updateListing(l.id, {
                              available: !l.available,
                            })
                          }
                          aria-label={l.available ? 'Hide listing' : 'Publish listing'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ marginTop: 12 }}>
            {sales.length === 0 ? (
              <EmptyState
                icon={<Wallet size={30} />}
                title="No orders yet"
                body="When a buyer places an order, it will appear here for you to confirm."
                action="Manage listings"
                onAction={() => setTab('listings')}
              />
            ) : (
              <div className="col" style={{ gap: 9 }}>
                {sales.slice(0, 6).map((o) => (
                  <button
                    className="order-card"
                    key={o.id}
                    onClick={() => navigate(`/order/${o.id}`)}
                    style={{ textAlign: 'left', width: '100%' }}
                  >
                    <div className="order-top">
                      <span className="order-id">#{o.id.slice(-7).toUpperCase()}</span>
                      <span className={`badge ${o.status === 'pending' ? 'gold' : o.status === 'confirmed' ? 'blue' : o.status === 'completed' ? 'green' : 'gray'}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="order-line">
                      <img src={o.lines[0]?.image} alt="" />
                      <div className="grow">
                        <div className="t">{o.lines[0]?.title}</div>
                        <div className="s">
                          Buyer: {state.users.find((u) => u.id === o.buyerId)?.name.split(' ')[0]} ·{' '}
                          {timeAgo(o.createdAt)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{peso(o.total)}</div>
                        <div className="tiny muted">
                          {o.status === 'completed' ? `Earn ${peso(o.subtotal - o.commission)}` : 'View'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                <button className="btn soft block" onClick={() => navigate('/orders')}>
                  View all orders <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'boosts' && (
          <div style={{ marginTop: 12 }}>
            <div className="boost-banner">
              <span className="spark">
                <Sparkles size={52} />
              </span>
              <h3>Get seen first.</h3>
              <p>
                Boost a listing from ₱50/day. More visibility, not a guaranteed top spot or sale.
              </p>
              <button
                className="btn sm"
                style={{ marginTop: 10, background: 'var(--navy-900)', color: '#fff' }}
                onClick={() => {
                  if (listings[0]) navigate(`/boost/${listings[0].id}`);
                  else navigate('/sell');
                }}
              >
                <Sparkles size={13} /> Boost a listing
              </button>
            </div>

            {boosts.length === 0 ? (
              <EmptyState
                icon={<CalendarClock size={30} />}
                title="No boosts yet"
                body="Promote a listing for 1, 3, 5, or 7 days. You can boost again to extend."
              />
            ) : (
              <div className="col" style={{ gap: 9, marginTop: 12 }}>
                {boosts.map((b) => {
                  const listing = state.listings.find((l) => l.id === b.listingId);
                  const active = new Date(b.endsAt) > new Date();
                  return (
                    <button
                      className="card pad"
                      key={b.id}
                      onClick={() => listing && navigate(`/product/${listing.id}`)}
                      style={{ textAlign: 'left', width: '100%', display: 'flex', gap: 11 }}
                    >
                      {listing && <img src={listing.image} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: 'cover' }} />}
                      <div className="grow">
                        <div style={{ fontSize: 11.5, fontWeight: 750, lineHeight: 1.35 }}>
                          {listing?.title ?? 'Listing removed'}
                        </div>
                        <div className="tiny muted" style={{ marginTop: 3 }}>
                          {b.days} days · {peso(b.amount)} · {b.payment}
                        </div>
                        <div className="row" style={{ gap: 5, marginTop: 4 }}>
                          <span className={`badge ${active ? 'gold' : 'gray'}`} style={{ height: 18, fontSize: 8.5 }}>
                            {active ? 'Active' : 'Ended'}
                          </span>
                          <span className="tiny muted">
                            {active ? `Until ${dayMonth(b.endsAt)}` : `Ended ${dayMonth(b.endsAt)}`}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: 'var(--muted-2)', alignSelf: 'center' }} />
                    </button>
                  );
                })}
              </div>
            )}
            <p className="hint center" style={{ marginTop: 12 }}>
              Boost payments are recorded in your seller history. See the{' '}
              <button
                style={{ textDecoration: 'underline', fontWeight: 700, color: 'var(--navy-500)' }}
                onClick={() => navigate('/policies/refunds')}
              >
                refund policy
              </button>
              .
            </p>
          </div>
        )}
      </div>

      <Sheet
        open={Boolean(target)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this listing?"
        subtitle={target?.title}
      >
        <div className="form-alert error">
          <Trash2 size={15} style={{ marginTop: 1 }} />
          <span>
            The listing will be removed from the marketplace and saved items. Existing orders are
            not affected.
          </span>
        </div>
        <button
          className="btn danger block lg"
          onClick={() => {
            if (deleteTarget) {
              deleteListing(deleteTarget);
              toast('Listing deleted.');
            }
            setDeleteTarget(null);
          }}
        >
          Delete listing
        </button>
        <button className="btn ghost block" style={{ marginTop: 4 }} onClick={() => setDeleteTarget(null)}>
          Keep listing
        </button>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ boost */

export function BoostScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, currentUser, boostListing } = useApp();
  const { toast } = useToast();
  const listing = state.listings.find((l) => l.id === id);
  const [days, setDays] = useState(3);
  const [payment, setPayment] = useState<PaymentMethod>('GCash');
  const [agree, setAgree] = useState(false);
  const [success, setSuccess] = useState<{ endsAt: string; amount: number } | null>(null);

  if (!listing || !currentUser || listing.sellerId !== currentUser.id) {
    return (
      <div className="screen">
        <PageHeader title="Boost listing" />
        <EmptyState
          icon={<Sparkles size={30} />}
          title="Listing not found"
          body="Choose one of your own listings from Seller Center to boost."
          action="Seller Center"
          onAction={() => navigate('/seller')}
        />
      </div>
    );
  }

  const pkg = BOOST_PACKAGES.find((p) => p.days === days) ?? BOOST_PACKAGES[1];
  const active = isBoostActive(listing);

  if (success) {
    return (
      <div className="screen">
        <PageHeader title="Boost activated" backTo="/seller" />
        <div className="page center" style={{ paddingTop: 28 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 26,
              margin: '0 auto 16px',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(145deg, #4a6fa5, #2d2fbf 50%, #6c4ce0)',
              color: '#fff',
              boxShadow: 'var(--shadow-gold)',
            }}
          >
            <Sparkles size={38} />
          </div>
          <span className="badge gold" style={{ marginBottom: 10 }}>
            <Sparkles size={11} /> Boost active
          </span>
          <h1 className="h1" style={{ fontSize: 26 }}>
            Your listing is boosted.
          </h1>
          <p className="small muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
            “{listing.title}” will receive additional visibility until{' '}
            <strong style={{ color: 'var(--ink)' }}>{shortDate(success.endsAt)}</strong>. You paid{' '}
            {peso(success.amount)}.
          </p>

          <div className="fee-box" style={{ marginTop: 18, textAlign: 'left' }}>
            <div className="row between">
              <span className="k">Promotion</span>
              <span className="v">{pkg.label} boost</span>
            </div>
            <div className="row between">
              <span className="k">Payment</span>
              <span className="v">{payment}</span>
            </div>
            <div className="row between total">
              <span className="k" style={{ color: '#fff' }}>
                Amount paid
              </span>
              <span className="v">{peso(success.amount)}</span>
            </div>
          </div>

          <div className="form-alert info" style={{ marginTop: 14, textAlign: 'left' }}>
            <ShieldCheck size={15} style={{ marginTop: 1, flex: '0 0 auto' }} />
            <span>
              Boosting increases visibility but does not guarantee a permanent top position or a
              completed sale. Payments are subject to the refund policy.
            </span>
          </div>

          <button className="btn primary block" style={{ marginTop: 8 }} onClick={() => navigate('/seller')}>
            Back to Seller Center
          </button>
          <button
            className="btn soft block"
            style={{ marginTop: 8 }}
            onClick={() => navigate(`/product/${listing.id}`)}
          >
            View my listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen has-cta">
      <PageHeader title="Boost listing" subtitle="More visibility on campus" backTo="/seller" />

      <div className="page">
        <div className="card pad" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img
            src={listing.image}
            alt=""
            style={{ width: 62, height: 62, borderRadius: 12, objectFit: 'cover' }}
          />
          <div className="grow">
            <div style={{ fontSize: 12.5, fontWeight: 750, lineHeight: 1.35 }}>{listing.title}</div>
            <div className="tiny muted" style={{ marginTop: 3 }}>
              {listing.type === 'sell'
                ? peso(listing.price)
                : listing.type === 'rent'
                  ? `${peso(listing.rentalPerDay ?? 0)}/day`
                  : 'Free to borrow'}{' '}
              · {listing.views} views
            </div>
            <div className="row" style={{ gap: 5, marginTop: 4 }}>
              {active ? (
                <span className="badge gold" style={{ height: 18, fontSize: 8.5 }}>
                  <Sparkles size={8} /> Boosted until {dayMonth(listing.boostedUntil)}
                </span>
              ) : (
                <span className="badge gray" style={{ height: 18, fontSize: 8.5 }}>
                  Not boosted
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="boost-banner" style={{ marginTop: 12 }}>
          <span className="spark">
            <Sparkles size={52} />
          </span>
          <h3>{active ? 'Extend your boost' : 'Stand out on campus.'}</h3>
          <p>
            Boosted listings get extra exposure in Home and Explore. Choose 1, 3, 5, or 7 days at
            ₱50 per day. No guaranteed sales.
          </p>
        </div>

        <h3 className="h3" style={{ margin: '18px 0 8px' }}>
          Choose a package
        </h3>
        {BOOST_PACKAGES.map((p) => (
          <button
            key={p.days}
            className={`boost-pkg ${days === p.days ? 'active' : ''}`}
            onClick={() => setDays(p.days)}
          >
            <span className="days">{p.days}d</span>
            <span className="grow">
              <span className="price">{peso(p.price)}</span>
              <span className="note" style={{ display: 'block' }}>
                {p.label} · {p.note} · ₱50/day
              </span>
            </span>
            <span className="pick">{days === p.days && <Check size={12} />}</span>
          </button>
        ))}

        <h3 className="h3" style={{ margin: '18px 0 8px' }}>
          Payment method
        </h3>
        {(['GCash', 'Maya', 'Cash on meetup'] as PaymentMethod[]).map((p) => (
          <button
            key={p}
            className={`payment-opt ${payment === p ? 'active' : ''}`}
            onClick={() => setPayment(p)}
          >
            <span className="radio">{payment === p && <Check size={12} />}</span>
            <span className="grow">
              <span className="name">{p}</span>
              <span className="sub">
                {p === 'Cash on meetup'
                  ? 'Pay the administrator at the CSAD office'
                  : 'Simulated payment for the prototype'}
              </span>
            </span>
          </button>
        ))}

        <div className="card pad" style={{ marginTop: 14 }}>
          <div className="summary-row">
            <span>{pkg.label} promotion</span>
            <strong>{peso(pkg.price)}</strong>
          </div>
          <div className="summary-row">
            <span>{active ? 'Extends current boost' : 'Visibility period'}</span>
            <strong>{active ? `+${pkg.days} days` : `${pkg.days} days`}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{peso(pkg.price)}</strong>
          </div>
        </div>

        <label className="check" style={{ marginTop: 14 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I understand that boosting increases visibility but does not guarantee a permanent top
            position or a completed sale. I agree to the{' '}
            <a href="#/policies/refunds">refund policy</a>.
          </span>
        </label>
      </div>

      <FloatingBoostBar
        price={pkg.price}
        disabled={!agree}
        onPay={() => {
          const boost = boostListing(listing.id, days, payment);
          if (boost) {
            setSuccess({ endsAt: boost.endsAt, amount: boost.amount });
            toast('Post boost activated.', 'success');
          }
        }}
      />
    </div>
  );
}

function FloatingBoostBar({
  price,
  disabled,
  onPay,
}: {
  price: number;
  disabled: boolean;
  onPay: () => void;
}) {
  return (
    <FloatingBar>
      <div className="price grow">
        <span>Total boost payment</span>
        <strong>{peso(price)}</strong>
      </div>
      <button className="btn gold" style={{ minWidth: 190 }} onClick={onPay} disabled={disabled}>
        <Sparkles size={15} /> Pay & boost
      </button>
    </FloatingBar>
  );
}
