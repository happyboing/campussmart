import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  PackageOpen,
  ShieldCheck,
  Share2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useApp, isBoostActive } from '../store';
import { categoryById, SAFE_SPOTS } from '../data/catalog';
import { addDays, dayMonth, peso, toLocalInput, typeLabel } from '../lib/format';
import {
  Avatar,
  EmptyState,
  ProductCard,
  Stars,
  VerifiedMark,
  useToast,
  SectionHead,
  PageHeader,
  Sheet,
  FloatingBar,
} from '../components/ui';
import { ReportSheet } from '../components/ReportSheet';
import type { PaymentMethod } from '../types';

const SLOTS = [
  { value: '10:00', label: '10:00 AM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];

export function ProductScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, currentUser, favoriteIds, toggleFavorite, addToCart, startConversation, placeRental } =
    useApp();
  const { toast } = useToast();
  const listing = state.listings.find((l) => l.id === id);
  const [requestOpen, setRequestOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const [startDate, setStartDate] = useState(toLocalInput(addDays(new Date(), 1)).slice(0, 10));
  const [days, setDays] = useState(1);
  const [slot, setSlot] = useState('10:00');
  const [spot, setSpot] = useState(SAFE_SPOTS[0].name);
  const [payment, setPayment] = useState<PaymentMethod>('Cash on meetup');
  const [agree, setAgree] = useState(false);

  const seller = state.users.find((u) => u.id === listing?.sellerId);
  const isOwner = currentUser?.id === listing?.sellerId;
  const isFav = listing ? favoriteIds.includes(listing.id) : false;
  const related = useMemo(
    () =>
      listing
        ? state.listings
            .filter(
              (l) =>
                l.id !== listing.id &&
                l.available &&
                (l.category === listing.category || l.sellerId === listing.sellerId),
            )
            .slice(0, 4)
        : [],
    [listing, state.listings],
  );

  if (!listing || !seller) {
    return (
      <div className="screen">
        <PageHeader title="Listing" />
        <EmptyState
          icon={<PackageOpen size={30} />}
          title="Listing not found"
          body="This item may have been removed or marked unavailable."
          action="Back to Explore"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  const cat = categoryById(listing.category);
  const boosted = isBoostActive(listing);
  const rentalFee = (listing.rentalPerDay ?? 0) * days;
  const deposit = listing.deposit ?? 0;
  const totalDue = listing.type === 'rent' ? rentalFee + deposit : deposit;

  const onMessage = () => {
    const cid = startConversation(listing.id);
    if (cid) navigate(`/chat/${cid}`);
  };

  const onAddToCart = () => {
    if (!currentUser) return navigate('/login');
    addToCart(listing.id);
    toast('Added to cart. Review it before checkout.', 'success');
  };

  const submitRequest = () => {
    if (!agree) {
      toast('Please agree to the rental and meetup terms.', 'error');
      return;
    }
    const meetupAt = new Date(`${startDate}T${slot}:00`).toISOString();
    const orderId = placeRental({
      listingId: listing.id,
      rentalStart: new Date(`${startDate}T${slot}:00`).toISOString(),
      rentalDays: days,
      meetupSpot: spot,
      meetupAt,
      payment,
      notes:
        listing.type === 'rent'
          ? `Rental request for ${days} day${days > 1 ? 's' : ''}.`
          : `Borrow request for ${days} day${days > 1 ? 's' : ''}.`,
    });
    if (orderId) {
      setRequestOpen(false);
      toast(
        listing.type === 'rent'
          ? 'Rental request sent to the seller.'
          : 'Borrow request sent to the seller.',
        'success',
      );
      navigate(`/order/${orderId}`);
    }
  };

  const cta =
    isOwner ? (
      <>
        <button
          className="btn soft"
          style={{ flex: '0 0 46%' }}
          onClick={() => navigate(`/sell?edit=${listing.id}`)}
        >
          Edit listing
        </button>
        <button className="btn gold grow" onClick={() => navigate(`/boost/${listing.id}`)}>
          <Sparkles size={15} /> Boost
        </button>
      </>
    ) : listing.type === 'sell' ? (
      <>
        <button className="icon-btn" onClick={onMessage} aria-label="Message seller" style={{ width: 48, height: 48, border: '1px solid var(--line)', borderRadius: 13, flex: '0 0 auto' }}>
          <MessageCircle size={20} />
        </button>
        <button
          className="btn primary grow"
          onClick={onAddToCart}
          disabled={!listing.available}
        >
          <ShoppingBag size={17} /> {listing.available ? 'Add to cart' : 'Unavailable'}
          <span style={{ opacity: 0.65, fontWeight: 600 }}>· {peso(listing.price)}</span>
        </button>
      </>
    ) : (
      <>
        <button
          className="icon-btn"
          onClick={onMessage}
          aria-label="Message seller"
          style={{ width: 48, height: 48, border: '1px solid var(--line)', borderRadius: 13, flex: '0 0 auto' }}
        >
          <MessageCircle size={20} />
        </button>
        <button
          className="btn primary grow"
          onClick={() => setRequestOpen(true)}
          disabled={!listing.available}
        >
          <CalendarDays size={17} />
          {!listing.available
            ? 'Unavailable'
            : listing.type === 'rent'
              ? 'Rent this item'
              : 'Request to borrow'}
        </button>
      </>
    );

  return (
    <div className="screen has-cta">
      <div className="detail-media">
        <img src={listing.image} alt={listing.title} />
        <div className="overlay-top">
          <button className="round-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div className="row" style={{ gap: 7 }}>
            <button
              className={`round-btn ${isFav ? 'on' : ''}`}
              onClick={() => toggleFavorite(listing.id)}
              aria-label={isFav ? 'Remove from saved' : 'Save listing'}
            >
              <Heart size={18} />
            </button>
            <button
              className="round-btn"
              aria-label="Share listing"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast('Listing link copied.', 'success');
                } catch {
                  toast('Sharing is unavailable in this browser.');
                }
              }}
            >
              <Share2 size={17} />
            </button>
          </div>
        </div>
        <div className="overlay-bottom">
          <span className={`badge ${listing.type === 'sell' ? 'navy' : listing.type === 'rent' ? 'teal' : 'violet'} lg`}>
            {typeLabel[listing.type]}
          </span>
          {boosted && (
            <span className="badge gold lg">
              <Sparkles size={11} /> Boosted
            </span>
          )}
          {!listing.available && <span className="badge gray lg">Unavailable</span>}
        </div>
      </div>

      <div className="detail-body">
        {boosted && (
          <div
            className="row"
            style={{
              gap: 8,
              background: '#fbf3d2',
              border: '1px solid #dcd2b8',
              borderRadius: 12,
              padding: '9px 11px',
              marginBottom: 12,
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--gold-600)', flex: '0 0 auto' }} />
            <span className="tiny" style={{ color: '#6e2247', lineHeight: 1.45 }}>
              <strong>Boosted listing.</strong> The seller paid for extra visibility. This does not
              guarantee top placement or a completed sale.
            </span>
          </div>
        )}

        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <span className={`badge ${listing.type === 'sell' ? 'gray' : listing.type === 'rent' ? 'teal' : 'violet'}`}>
            {cat.short}
          </span>
          <span className="row tiny muted" style={{ gap: 5 }}>
            <Eye size={12} /> {listing.views} views · {dayMonth(listing.createdAt)}
          </span>
        </div>

        <div className="price-xl" style={{ marginTop: 10 }}>
          {listing.type === 'sell' ? (
            peso(listing.price)
          ) : listing.type === 'rent' ? (
            <>
              {peso(listing.rentalPerDay ?? 0)}
              <span className="per"> / day</span>
            </>
          ) : (
            'Free'
          )}
        </div>
        {listing.type !== 'sell' && deposit > 0 && (
          <div className="tiny muted" style={{ marginTop: 4 }}>
            + {peso(deposit)} refundable deposit
          </div>
        )}

        <h1 className="detail-title">{listing.title}</h1>

        <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
          <span className="badge outline">{listing.condition}</span>
          <span className="badge outline">{cat.name}</span>
          <span className="badge outline">
            <MapPin size={10} /> {listing.meetupSpots.length} meetup spot
            {listing.meetupSpots.length > 1 ? 's' : ''}
          </span>
        </div>

        <button
          className="seller-row"
          style={{ marginTop: 16 }}
          onClick={() => navigate(`/seller/${seller.id}`)}
        >
          <Avatar user={seller} />
          <div className="grow">
            <div className="name">
              {seller.name}
              {seller.verified && <VerifiedMark />}
            </div>
            <div className="sub">
              <Stars rating={seller.rating} count={seller.reviewCount} />
              <span>·</span>
              <span>{seller.department.replace('College of ', '')}</span>
            </div>
          </div>
          <ChevronRight size={17} style={{ color: 'var(--muted-2)' }} />
        </button>

        <div style={{ marginTop: 16 }}>
          <h3 className="h3" style={{ marginBottom: 6 }}>
            About this item
          </h3>
          <p className="description">{listing.description}</p>
        </div>

        <div className="spec-grid" style={{ marginTop: 16 }}>
          <div className="spec">
            <span className="k">Condition</span>
            <span className="v">{listing.condition}</span>
          </div>
          <div className="spec">
            <span className="k">Transaction</span>
            <span className="v">{typeLabel[listing.type]}</span>
          </div>
          <div className="spec">
            <span className="k">{listing.type === 'rent' ? 'Daily rate' : 'Price'}</span>
            <span className="v">
              {listing.type === 'sell'
                ? peso(listing.price)
                : listing.type === 'rent'
                  ? `${peso(listing.rentalPerDay ?? 0)} / day`
                  : 'Free'}
            </span>
          </div>
          <div className="spec">
            <span className="k">Deposit</span>
            <span className="v">{deposit > 0 ? peso(deposit) : 'None'}</span>
          </div>
        </div>

        {listing.terms && (
          <div className="inset" style={{ marginTop: 16, border: '1px solid #dcd2b8', background: '#fbf3d2' }}>
            <div className="row" style={{ gap: 6, marginBottom: 5 }}>
              <ShieldCheck size={14} style={{ color: 'var(--gold-600)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#6e2247' }}>
                {listing.type === 'rent' ? 'Rental terms' : 'Borrowing terms'}
              </span>
            </div>
            <p style={{ fontSize: 11.5, lineHeight: 1.55, color: '#6e2247' }}>{listing.terms}</p>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <h3 className="h3" style={{ marginBottom: 8 }}>
            Safe meetup spots
          </h3>
          <div className="col" style={{ gap: 7 }}>
            {SAFE_SPOTS.filter((s) => listing.meetupSpots.includes(s.id)).map((s) => (
              <div className="meetup-chip" key={s.id}>
                <span className="icon">
                  <MapPin size={15} />
                </span>
                <div>
                  <div className="name">{s.name}</div>
                  <div className="detail">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="inset" style={{ marginTop: 16 }}>
          <div className="row start" style={{ gap: 7 }}>
            <ShieldCheck size={14} style={{ color: 'var(--teal-600)', marginTop: 1, flex: '0 0 auto' }} />
            <p className="tiny muted" style={{ lineHeight: 1.55 }}>
              CampuSmart connects buyers and sellers but does not inspect items. Check the item
              before paying, keep your chat history, and meet only at designated campus spots.
            </p>
          </div>
        </div>

        <div className="row between" style={{ marginTop: 16 }}>
          <button
            className="row tiny"
            style={{ color: 'var(--muted)', gap: 5 }}
            onClick={() => setReportOpen(true)}
          >
            <Flag size={12} /> Report this listing
          </button>
          <span className="tiny muted">Listed {dayMonth(listing.createdAt)}</span>
        </div>

        {related.length > 0 && (
          <div style={{ margin: '22px -20px 0' }}>
            <SectionHead title="You might also like" />
            <div className="grid-2" style={{ padding: '0 20px' }}>
              {related.map((l) => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>

      <FloatingBar>{cta}</FloatingBar>

      <RequestSheet
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        listingType={listing.type}
        pricePerDay={listing.rentalPerDay ?? 0}
        deposit={deposit}
        startDate={startDate}
        setStartDate={setStartDate}
        days={days}
        setDays={setDays}
        slot={slot}
        setSlot={setSlot}
        spot={spot}
        setSpot={setSpot}
        payment={payment}
        setPayment={setPayment}
        agree={agree}
        setAgree={setAgree}
        totalDue={totalDue}
        onSubmit={submitRequest}
        spots={SAFE_SPOTS.filter((s) => listing.meetupSpots.includes(s.id))}
      />

      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        listingId={listing.id}
        targetName={listing.title}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ request sheet */

function RequestSheet({
  open,
  onClose,
  listingType,
  pricePerDay,
  deposit,
  startDate,
  setStartDate,
  days,
  setDays,
  slot,
  setSlot,
  spot,
  setSpot,
  payment,
  setPayment,
  agree,
  setAgree,
  totalDue,
  onSubmit,
  spots,
}: {
  open: boolean;
  onClose: () => void;
  listingType: 'sell' | 'rent' | 'borrow';
  pricePerDay: number;
  deposit: number;
  startDate: string;
  setStartDate: (v: string) => void;
  days: number;
  setDays: (v: number) => void;
  slot: string;
  setSlot: (v: string) => void;
  spot: string;
  setSpot: (v: string) => void;
  payment: PaymentMethod;
  setPayment: (v: PaymentMethod) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  totalDue: number;
  onSubmit: () => void;
  spots: typeof SAFE_SPOTS;
}) {
  const isRent = listingType === 'rent';
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isRent ? 'Rent this item' : 'Request to borrow'}
      subtitle={
        isRent
          ? 'Choose your dates and meetup. The seller confirms availability next.'
          : 'Borrowing is free. A refundable deposit may apply.'
      }
    >
      <div>
        <div className="row" style={{ gap: 8, marginBottom: 12 }}>
          <div className="field grow" style={{ marginBottom: 0 }}>
            <label className="label" htmlFor="rent-start">
              {isRent ? 'Start date' : 'Pickup date'}
            </label>
            <input
              id="rent-start"
              className="input"
              type="date"
              min={toLocalInput(new Date()).slice(0, 10)}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="field" style={{ width: 120, marginBottom: 0 }}>
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

        <div className="row between" style={{ marginBottom: 14 }}>
          <span className="label">{isRent ? 'Rental days' : 'Borrowing days'}</span>
          <div className="qty">
            <button onClick={() => setDays(Math.max(1, days - 1))} aria-label="Fewer days">
              –
            </button>
            <span>{days}</span>
            <button onClick={() => setDays(Math.min(14, days + 1))} aria-label="More days">
              +
            </button>
          </div>
        </div>

        <div className="summary-row">
          <span>{isRent ? `${peso(pricePerDay)} × ${days} day${days > 1 ? 's' : ''}` : 'Borrow fee'}</span>
          <strong>{isRent ? peso(pricePerDay * days) : 'Free'}</strong>
        </div>
        <div className="summary-row">
          <span>Refundable deposit</span>
          <strong>{deposit ? peso(deposit) : 'None'}</strong>
        </div>
        <div className="summary-row total">
          <span>Due at meetup</span>
          <strong>{peso(totalDue)}</strong>
        </div>

        <h4 className="h4" style={{ margin: '16px 0 8px' }}>
          Meetup spot
        </h4>
        {spots.map((s) => (
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
          </button>
        ))}

        <h4 className="h4" style={{ margin: '16px 0 8px' }}>
          Payment
        </h4>
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
                  ? 'Pay in person after inspecting the item'
                  : 'Arrange the transfer directly with the seller'}
              </span>
            </span>
          </button>
        ))}

        <label className="check" style={{ margin: '14px 0' }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I agree to the rental/borrowing terms, the refund policy, and the safe meetup rules.
            Deposits are returned after the seller inspects the item.
          </span>
        </label>

        <button className="btn gold block lg" onClick={onSubmit}>
          Send request · {peso(totalDue)}
        </button>
      </div>
    </Sheet>
  );
}
