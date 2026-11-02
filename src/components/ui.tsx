import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  Heart,
  Sparkles,
  Star,
  X,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import type { Listing, User } from '../types';
import { initials, peso, typeLabel } from '../lib/format';
import { useApp, isBoostActive } from '../store';

/* ------------------------------------------------------------------ logo */

export function Logo({ size = 30, light = false }: { size?: number; light?: boolean }) {
  return (
    <img
      className={`logo-img ${light ? 'light' : ''}`}
      src="/img/logo-mark.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
}

export function Wordmark({
  light = false,
  height = 30,
}: {
  light?: boolean;
  height?: number;
}) {
  return (
    <img
      className="wordmark-img"
      src={light ? '/img/logo.png' : '/img/logo-dark.png'}
      alt="CampuSmart"
      style={{ height }}
    />
  );
}

/* ------------------------------------------------------------------ avatar */

export function Avatar({
  user,
  size = 'md',
  online,
}: {
  user: Pick<User, 'name' | 'hue'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
}) {
  return (
    <span
      className={`avatar ${size === 'md' ? '' : size}`}
      style={{ '--hue': user.hue } as CSSProperties}
      aria-hidden="true"
    >
      {initials(user.name)}
      {online && <span className="dot" />}
    </span>
  );
}

export function VerifiedMark() {
  return (
    <span className="verified-mark" title="Verified campus member">
      <Check />
    </span>
  );
}

export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span className="row" style={{ gap: 3 }}>
      <span className="stars">
        <Star size={11} />
      </span>
      <span style={{ fontSize: 10.5, fontWeight: 700 }}>
        {rating ? rating.toFixed(1) : 'New'}
      </span>
      {count !== undefined && count > 0 && (
        <span style={{ fontSize: 10, color: 'var(--muted-2)' }}>({count})</span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ page header */

export function PageHeader({
  title,
  right,
  subtitle,
  backTo,
  transparent,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  backTo?: string;
  transparent?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div
      className="topbar"
      style={
        transparent
          ? { background: 'transparent', backdropFilter: 'none', borderBottomColor: 'transparent' }
          : undefined
      }
    >
      <div className="topbar-inner">
        <button
          className="icon-btn"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          aria-label="Go back"
        >
          <ChevronLeft size={21} />
        </button>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="title">{title}</div>
          {subtitle && (
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: -1 }}>{subtitle}</div>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ section */

export function SectionHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {action && (
        <button className="link" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ product */

export function ProductCard({
  listing,
  horizontal = false,
}: {
  listing: Listing;
  horizontal?: boolean;
}) {
  const navigate = useNavigate();
  const { state, favoriteIds, toggleFavorite } = useApp();
  const seller = state.users.find((u) => u.id === listing.sellerId);
  const isFav = favoriteIds.includes(listing.id);
  const boosted = isBoostActive(listing);
  const price =
    listing.type === 'borrow' ? 'Free' : peso(listing.type === 'rent' ? listing.rentalPerDay ?? 0 : listing.price);

  return (
    <article className={`product-card ${horizontal ? 'h-card' : ''}`}>
      <button
        className="product-media"
        onClick={() => navigate(`/product/${listing.id}`)}
        aria-label={`View ${listing.title}`}
        style={{ border: '1px solid var(--line)' }}
      >
        <img src={listing.image} alt={listing.title} loading="lazy" />
        {boosted && (
          <span className="boost-flag">
            <Sparkles size={10} /> BOOSTED
          </span>
        )}
        <span className={`type-tag ${listing.type}`}>{typeLabel[listing.type]}</span>
        {!listing.available && <span className="unavailable">Unavailable</span>}
        <span
          className={`fav ${isFav ? 'on' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={isFav ? 'Remove from saved' : 'Save listing'}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(listing.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              toggleFavorite(listing.id);
            }
          }}
        >
          <Heart size={14} />
        </span>
      </button>
      <button
        className="product-info"
        onClick={() => navigate(`/product/${listing.id}`)}
        style={{ textAlign: 'left' }}
      >
        <span className="product-price">
          {price}
          {listing.type === 'rent' && <span>/ day</span>}
          {listing.type === 'borrow' && <span>+ deposit</span>}
        </span>
        <span className="product-title">{listing.title}</span>
        <span className="product-meta">
          {seller?.verified && <VerifiedMark />}
          <span className="name">{seller?.name.split(' ')[0]}</span>
          <span>·</span>
          <span>{listing.condition}</span>
        </span>
      </button>
    </article>
  );
}

/* ------------------------------------------------------------------ order status */

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'badge gold', label: 'Pending' },
    confirmed: { cls: 'badge blue', label: 'Confirmed' },
    completed: { cls: 'badge green', label: 'Completed' },
    cancelled: { cls: 'badge gray', label: 'Cancelled' },
    open: { cls: 'badge red', label: 'Open' },
    resolved: { cls: 'badge green', label: 'Resolved' },
    dismissed: { cls: 'badge gray', label: 'Dismissed' },
  };
  const item = map[status] ?? { cls: 'badge gray', label: status };
  return <span className={item.cls}>{item.label}</span>;
}

/* ------------------------------------------------------------------ empty */

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty">
      <div className="art">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action && (
        <button className="btn primary sm" style={{ marginTop: 8 }} onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ sheet */

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  right,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const host = document.getElementById('app-device') ?? document.body;

  return createPortal(
    <div
      className="sheet-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="sheet">
        <div className="sheet-handle" />
        {(title || right) && (
          <div className="sheet-head">
            <div>
              {title && <h2>{title}</h2>}
              {subtitle && <p>{subtitle}</p>}
            </div>
            {right ?? (
              <button className="icon-btn" onClick={onClose} aria-label="Close">
                <X size={19} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    host,
  );
}

/* ------------------------------------------------------------------ toast */

interface ToastItem {
  id: number;
  message: string;
  tone?: 'default' | 'success' | 'error';
}

const ToastContext = createContext<{ toast: (message: string, tone?: ToastItem['tone']) => void } | null>(
  null,
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, tone: ToastItem['tone'] = 'default') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);
  const host = typeof document !== 'undefined' ? document.getElementById('app-device') : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {host &&
        createPortal(
          <div className="toast-wrap" aria-live="polite">
            {items.map((t) => (
              <div className="toast" key={t.id}>
                <span className="ico">
                  {t.tone === 'success' ? (
                    <PartyPopper size={16} />
                  ) : t.tone === 'error' ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Sparkles size={15} />
                  )}
                </span>
                <span>{t.message}</span>
              </div>
            ))}
          </div>,
          host,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

/* ------------------------------------------------------------------ misc */

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="row between" style={{ padding: '7px 0' }}>
      <span className="row muted" style={{ gap: 7, fontSize: 12 }}>
        {icon}
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export function FloatingBar({
  children,
  aboveNav = false,
}: {
  children: ReactNode;
  aboveNav?: boolean;
}) {
  const host = typeof document !== 'undefined' ? document.getElementById('app-device') : null;
  if (!host) return null;
  return createPortal(
    <div className={`sticky-cta ${aboveNav ? 'above-nav' : ''}`}>{children}</div>,
    host,
  );
}
