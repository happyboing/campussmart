import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Lock,
  MapPin,
  Minus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import { useApp } from '../store';
import { SAFE_SPOTS } from '../data/catalog';
import { addDays, peso, toLocalInput, typeLabel } from '../lib/format';
import { EmptyState, PageHeader, useToast, FloatingBar, ProductCard, SectionHead } from '../components/ui';
import type { PaymentMethod } from '../types';

const SLOTS = [
  { value: '10:00', label: '10:00 AM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];

export function CartScreen() {
  const navigate = useNavigate();
  const { cart, state, currentUser, updateCartQty, removeFromCart } = useApp();

  const lines = cart.flatMap((item) => {
    const listing = state.listings.find((l) => l.id === item.listingId);
    return listing ? [{ ...item, listing }] : [];
  });
  const subtotal = lines.reduce((sum, l) => sum + l.listing.price * l.qty, 0);
  const commission = Math.round(subtotal * 0.05 * 100) / 100;
  const suggestions = state.listings
    .filter(
      (l) =>
        l.available &&
        l.sellerId !== currentUser?.id &&
        !cart.some((c) => c.listingId === l.id),
    )
    .slice(0, 6);

  if (!currentUser) {
    return (
      <div className="screen">
        <PageHeader title="Cart" backTo="/home" />
        <EmptyState
          icon={<ShoppingBag size={30} />}
          title="Sign in to view your cart"
          body="Your cart saves the items you want to buy from student sellers."
          action="Sign in"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  return (
    <div className={`screen ${lines.length ? 'has-cta' : ''}`}>
      <PageHeader
        title="Shopping cart"
        subtitle={`${lines.length} item${lines.length === 1 ? '' : 's'} · ${peso(subtotal)}`}
        backTo="/home"
      />

      {lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={30} />}
          title="Your cart is empty"
          body="Browse textbooks, calculators, snacks, and campus essentials from verified sellers."
          action="Explore the marketplace"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="page">
          <div className="card pad">
            {lines.map(({ listing, qty }) => {
              const seller = state.users.find((u) => u.id === listing.sellerId);
              return (
                <div className="cart-item" key={listing.id}>
                  <img className="cart-thumb" src={listing.image} alt="" />
                  <div className="grow">
                    <div className="row between" style={{ alignItems: 'flex-start', gap: 6 }}>
                      <button
                        style={{ textAlign: 'left' }}
                        onClick={() => navigate(`/product/${listing.id}`)}
                      >
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 750,
                            lineHeight: 1.35,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {listing.title}
                        </div>
                      </button>
                      <button
                        className="icon-btn"
                        style={{ width: 28, height: 28, flex: '0 0 auto' }}
                        onClick={() => removeFromCart(listing.id)}
                        aria-label={`Remove ${listing.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="tiny muted" style={{ marginTop: 2 }}>
                      <Store size={10} style={{ verticalAlign: -1 }} />{' '}
                      {seller?.name.split(' ')[0]} · {listing.condition}
                    </div>
                    <div className="row between" style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {peso(listing.price)}
                      </span>
                      <div className="qty">
                        <button
                          onClick={() => updateCartQty(listing.id, qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{qty}</span>
                        <button
                          onClick={() => updateCartQty(listing.id, qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card pad" style={{ marginTop: 12 }}>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{peso(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Buyer service fee</span>
              <strong style={{ color: 'var(--success)' }}>₱0</strong>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <strong>Campus meetup</strong>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <strong>{peso(subtotal)}</strong>
            </div>
          </div>

          <div className="inset row start" style={{ marginTop: 12, gap: 8 }}>
            <ShieldCheck size={15} style={{ color: 'var(--teal-600)', marginTop: 1, flex: '0 0 auto' }} />
            <p className="tiny muted" style={{ lineHeight: 1.5 }}>
              No hidden charges. CampuSmart's 5% commission ({peso(commission)}) is deducted from the
              seller's payout, not added to your total. Pay only after inspecting the item at a safe
              campus meetup.
            </p>
          </div>

          <div className="row" style={{ gap: 7, marginTop: 12 }}>
            <span className="badge outline">
              <Truck size={11} /> No delivery fees
            </span>
            <span className="badge outline">
              <Lock size={11} /> Meetup only
            </span>
          </div>

          {suggestions.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <SectionHead
                title="More for your campus"
                action="See all"
                onAction={() => navigate('/explore')}
              />
              <div className="scroll-x">
                {suggestions.map((l) => (
                  <ProductCard key={l.id} listing={l} horizontal />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {lines.length > 0 && (
        <FloatingBar>
          <div className="price grow">
            <span>Total ({lines.length} item{lines.length === 1 ? '' : 's'})</span>
            <strong>{peso(subtotal)}</strong>
          </div>
          <button className="btn gold" style={{ minWidth: 190 }} onClick={() => navigate('/checkout')}>
            Checkout <ArrowRight size={16} />
          </button>
        </FloatingBar>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ checkout */

export function CheckoutScreen() {
  const navigate = useNavigate();
  const { cart, state, placeCartOrders } = useApp();
  const { toast } = useToast();
  const [spot, setSpot] = useState(SAFE_SPOTS[0].name);
  const [date, setDate] = useState(toLocalInput(addDays(new Date(), 1)).slice(0, 10));
  const [slot, setSlot] = useState('10:00');
  const [payment, setPayment] = useState<PaymentMethod>('Cash on meetup');
  const [notes, setNotes] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const lines = useMemo(
    () =>
      cart.flatMap((item) => {
        const listing = state.listings.find((l) => l.id === item.listingId);
        return listing ? [{ ...item, listing }] : [];
      }),
    [cart, state.listings],
  );
  const subtotal = lines.reduce((sum, l) => sum + l.listing.price * l.qty, 0);
  const sellers = new Set(lines.map((l) => l.listing.sellerId));

  if (lines.length === 0) {
    return (
      <div className="screen">
        <PageHeader title="Checkout" />
        <EmptyState
          icon={<ShoppingBag size={30} />}
          title="Nothing to check out"
          body="Add items to your cart first."
          action="Explore"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const submit = () => {
    if (!agree) {
      toast('Please agree to the terms and meetup policy.', 'error');
      return;
    }
    setBusy(true);
    const meetupAt = new Date(`${date}T${slot}:00`).toISOString();
    window.setTimeout(() => {
      const ids = placeCartOrders({
        meetupSpot: spot,
        meetupAt,
        payment,
        notes: notes.trim() || undefined,
      });
      setBusy(false);
      if (!ids.length) {
        toast('Could not place the order. Please try again.', 'error');
        return;
      }
      toast(
        ids.length > 1
          ? `${ids.length} orders placed with different sellers.`
          : 'Order placed. The seller will confirm shortly.',
        'success',
      );
      navigate(`/orders?new=1${ids.length === 1 ? `&id=${ids[0]}` : ''}`);
    }, 500);
  };

  return (
    <div className="screen has-cta">
      <PageHeader title="Checkout" subtitle="Arrange a safe campus meetup" backTo="/cart" />

      <div className="page">
        <div className="row" style={{ gap: 6, marginBottom: 12 }}>
          <span className="badge teal">
            <ShieldCheck size={11} /> Verified sellers
          </span>
          <span className="badge outline">
            {sellers.size} seller{sellers.size > 1 ? 's' : ''}
          </span>
        </div>

        <h3 className="h3" style={{ marginBottom: 8 }}>
          Meetup details
        </h3>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <div className="field grow" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor="meet-date">
              Date
            </label>
            <input
              id="meet-date"
              className="input"
              type="date"
              min={toLocalInput(new Date()).slice(0, 10)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field" style={{ width: 122, marginBottom: 0 }}>
            <span className="label">Time</span>
            <select className="select" value={slot} onChange={(e) => setSlot(e.target.value)}>
              {SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col" style={{ gap: 8 }}>
          {SAFE_SPOTS.map((s) => (
            <button
              key={s.id}
              className={`meetup-opt ${spot === s.name ? 'active' : ''}`}
              onClick={() => setSpot(s.name)}
            >
              <span className="radio">{spot === s.name && <Check size={12} />}</span>
              <span>
                <span className="name">{s.name}</span>
                <span className="detail">{s.detail}</span>
              </span>
              <MapPin
                size={15}
                style={{ marginLeft: 'auto', color: spot === s.name ? 'var(--navy-600)' : 'var(--muted-2)' }}
              />
            </button>
          ))}
        </div>

        <h3 className="h3" style={{ margin: '20px 0 8px' }}>
          Payment method
        </h3>
        {(['Cash on meetup', 'GCash', 'Maya'] as PaymentMethod[]).map((p) => (
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
                  ? 'Pay after inspecting the item'
                  : 'Send payment directly to the seller before or at meetup'}
              </span>
            </span>
          </button>
        ))}
        <p className="hint" style={{ marginTop: 6 }}>
          CampuSmart does not process payments in this version. Buyers and sellers arrange payment
          directly and should keep proof of payment.
        </p>

        <div className="field" style={{ marginTop: 16 }}>
          <label className="label" htmlFor="checkout-notes">
            Note to seller <span className="opt">optional</span>
          </label>
          <textarea
            id="checkout-notes"
            className="textarea"
            style={{ minHeight: 74 }}
            placeholder="e.g. I'll be at the library by 10:15 AM."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <h3 className="h3" style={{ margin: '4px 0 8px' }}>
          Order summary
        </h3>
        <div className="card pad">
          {lines.map(({ listing, qty }) => (
            <div className="order-line" key={listing.id} style={{ marginBottom: 10 }}>
              <img src={listing.image} alt="" />
              <div className="grow">
                <div className="t">{listing.title}</div>
                <div className="s">
                  {qty} × {peso(listing.price)} · {typeLabel[listing.type]}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800 }}>{peso(listing.price * qty)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{peso(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Buyer service fee</span>
            <strong style={{ color: 'var(--success)' }}>₱0</strong>
          </div>
          <div className="summary-row total">
            <span>Total due at meetup</span>
            <strong>{peso(subtotal)}</strong>
          </div>
        </div>

        <label className="check" style={{ marginTop: 14 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I agree to the <a href="#/policies/terms">Terms & Conditions</a>, the{' '}
            <a href="#/policies/refunds">cancellation policy</a>, and will meet only at a designated
            safe campus spot. I will inspect the item before paying.
          </span>
        </label>

        <div className="inset row start" style={{ marginTop: 12, gap: 8 }}>
          <Store size={15} style={{ color: 'var(--navy-600)', marginTop: 1, flex: '0 0 auto' }} />
          <p className="tiny muted" style={{ lineHeight: 1.5 }}>
            Orders are split by seller. Each seller confirms your meetup and marks the transaction
            complete. Your purchase supports student entrepreneurs.
          </p>
        </div>
      </div>

      <FloatingBar>
        <div className="price grow">
          <span>{lines.length} item{lines.length === 1 ? '' : 's'} · no buyer fees</span>
          <strong>{peso(subtotal)}</strong>
        </div>
        <button className="btn gold" style={{ minWidth: 180 }} onClick={submit} disabled={busy}>
          {busy ? 'Placing…' : 'Place order'} <ChevronRight size={17} />
        </button>
      </FloatingBar>
    </div>
  );
}
