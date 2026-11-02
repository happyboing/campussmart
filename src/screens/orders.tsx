import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  PackageCheck,
  PackageOpen,
  Receipt,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../store';
import type { Order, OrderStatus } from '../types';
import {
  Avatar,
  EmptyState,
  OrderStatusBadge,
  PageHeader,
  Sheet,
  VerifiedMark,
  useToast,
} from '../components/ui';
import { RatingSheet } from '../components/RatingSheet';
import { addDays, dateTime, peso, shortDate, timeAgo, typeLabel } from '../lib/format';

const STATUS_FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const CANCEL_REASONS = [
  'Changed my mind',
  'Could not agree on a meetup time',
  'Seller is no longer available',
  'Item was not as described',
  'Requested by the other party',
  'Other reason',
];

export function OrdersScreen() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { state, currentUser, updateOrderStatus, startOrderConversation } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState<'purchases' | 'sales'>('purchases');
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [rateTarget, setRateTarget] = useState<Order | null>(null);

  const isNew = params.get('new') === '1';

  const orders = useMemo(() => {
    if (!currentUser) return [];
    return [...state.orders]
      .filter((o) =>
        tab === 'purchases' ? o.buyerId === currentUser.id : o.sellerId === currentUser.id,
      )
      .filter((o) => status === 'all' || o.status === status)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [state.orders, currentUser, tab, status]);

  const salesStats = useMemo(() => {
    if (!currentUser) return { pending: 0, earnings: 0, sold: 0 };
    const sales = state.orders.filter((o) => o.sellerId === currentUser.id);
    return {
      pending: sales.filter((o) => o.status === 'pending' || o.status === 'confirmed').length,
      earnings: sales
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + (o.subtotal - o.commission), 0),
      sold: sales.filter((o) => o.status === 'completed').length,
    };
  }, [state.orders, currentUser]);

  const confirmOrder = (order: Order, next: OrderStatus) => {
    updateOrderStatus(order.id, next);
    toast(
      next === 'confirmed'
        ? 'Order confirmed. The buyer has been notified.'
        : next === 'completed'
          ? 'Transaction completed. Commission recorded.'
          : 'Order updated.',
      'success',
    );
  };

  return (
    <div className="screen">
      <PageHeader
        title="Orders & transactions"
        subtitle="Track purchases and sales"
        backTo="/profile"
        right={
          <button className="icon-btn" onClick={() => navigate('/cart')} aria-label="Cart">
            <ShoppingBag size={19} />
          </button>
        }
      />

      {isNew && (
        <div style={{ padding: '0 20px 4px' }}>
          <div
            className="card"
            style={{
              padding: 14,
              display: 'flex',
              gap: 11,
              alignItems: 'center',
              background: 'linear-gradient(145deg, #e8e9fa, #f7f8ff)',
              borderColor: '#d8d9f5',
            }}
          >
            <span
              className="success-pop"
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                background: '#fff',
                color: 'var(--success)',
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
              }}
            >
              <CheckCircle2 size={21} />
            </span>
            <div className="grow">
              <div style={{ fontSize: 12.5, fontWeight: 800 }}>Order placed successfully</div>
              <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>
                The seller will confirm your meetup. Pay only after inspecting the item.
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={() => {
                params.delete('new');
                setParams(params, { replace: true });
              }}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '12px 20px 0' }}>
        <div className="segmented">
          <button
            className={tab === 'purchases' ? 'active' : ''}
            onClick={() => {
              setTab('purchases');
              setStatus('all');
            }}
          >
            <ShoppingBag size={14} /> Purchases
          </button>
          <button
            className={tab === 'sales' ? 'active' : ''}
            onClick={() => {
              setTab('sales');
              setStatus('all');
            }}
          >
            <Store size={14} /> Sales
            {salesStats.pending > 0 && (
              <span className="badge gold" style={{ height: 17, padding: '0 5px', fontSize: 9 }}>
                {salesStats.pending}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === 'sales' && (
        <div style={{ padding: '12px 20px 0' }}>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="stat-card">
              <div className="k">To fulfill</div>
              <div className="v">{salesStats.pending}</div>
            </div>
            <div className="stat-card">
              <div className="k">Completed</div>
              <div className="v">{salesStats.sold}</div>
            </div>
            <div className="stat-card dark">
              <div className="k">Net earnings</div>
              <div className="v" style={{ fontSize: 17 }}>
                {peso(salesStats.earnings)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="scroll-x" style={{ padding: '12px 20px 4px', margin: 0 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`chip ${status === f.id ? 'active' : ''}`}
            style={{ minHeight: 32, padding: '0 11px', fontSize: 11 }}
            onClick={() => setStatus(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="page tight" style={{ paddingTop: 10 }}>
        {orders.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={30} />}
            title={tab === 'purchases' ? 'No purchases yet' : 'No sales yet'}
            body={
              tab === 'purchases'
                ? 'When you place an order, you can track its status and meetup details here.'
                : 'List an item from the Sell tab and your incoming orders will appear here.'
            }
            action={tab === 'purchases' ? 'Explore the marketplace' : 'Create a listing'}
            onAction={() => navigate(tab === 'purchases' ? '/explore' : '/sell')}
          />
        ) : (
          <div className="col" style={{ gap: 11 }}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                perspective={tab === 'purchases' ? 'buyer' : 'seller'}
                onOpen={() => navigate(`/order/${order.id}`)}
                onConfirm={() => confirmOrder(order, 'confirmed')}
                onComplete={() => confirmOrder(order, 'completed')}
                onCancel={() => setCancelTarget(order)}
                onRate={() => setRateTarget(order)}
                onMessage={() => {
                  const cid = startOrderConversation(order.id);
                  if (cid) navigate(`/chat/${cid}`);
                }}
                otherName={
                  state.users.find((u) =>
                    tab === 'purchases' ? u.id === order.sellerId : u.id === order.buyerId,
                  )?.name ?? 'CampuSmart user'
                }
              />
            ))}
          </div>
        )}

        <button
          className="row"
          style={{ margin: '18px auto 0', color: 'var(--muted)', fontSize: 10.5, gap: 5 }}
          onClick={() => navigate('/policies/refunds')}
        >
          <ShieldCheck size={12} /> Cancellation & refund policy
        </button>
      </div>

      <CancelSheet
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) {
            updateOrderStatus(cancelTarget.id, 'cancelled', reason);
            toast('Order cancelled. No commission will be charged.', 'success');
          }
          setCancelTarget(null);
        }}
      />
      {rateTarget && (
        <RatingSheet
          open={Boolean(rateTarget)}
          onClose={() => setRateTarget(null)}
          orderId={rateTarget.id}
          sellerName={
            state.users.find((u) => u.id === rateTarget.sellerId)?.name ?? 'the seller'
          }
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ card */

function OrderCard({
  order,
  perspective,
  onOpen,
  onConfirm,
  onComplete,
  onCancel,
  onRate,
  onMessage,
  otherName,
}: {
  order: Order;
  perspective: 'buyer' | 'seller';
  onOpen: () => void;
  onConfirm: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onRate: () => void;
  onMessage: () => void;
  otherName: string;
}) {
  const item = order.lines[0];
  const extra = order.lines.length - 1;
  return (
    <article className="order-card">
      <button
        className="order-top"
        onClick={onOpen}
        style={{ textAlign: 'left', width: '100%' }}
      >
        <span className="order-id">#{order.id.slice(-7).toUpperCase()}</span>
        <span className="row" style={{ gap: 6 }}>
          <span className="tiny muted">{timeAgo(order.createdAt)}</span>
          <OrderStatusBadge status={order.status} />
        </span>
      </button>

      <button className="order-line" onClick={onOpen} style={{ textAlign: 'left', width: '100%' }}>
        <img src={item?.image} alt="" />
        <div className="grow">
          <div className="t">{item?.title}</div>
          <div className="s">
            {perspective === 'buyer' ? `Seller: ${otherName}` : `Buyer: ${otherName}`}
            {item?.qty > 1 ? ` · ${item.qty} pcs` : ''}
            {extra > 0 ? ` · +${extra} more` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {peso(order.total)}
          </div>
          <div className="tiny muted">{typeLabel[item?.type ?? 'sell']}</div>
        </div>
      </button>

      <div className="row between" style={{ gap: 8 }}>
        <span className="row tiny muted" style={{ gap: 5 }}>
          <MapPin size={11} /> {order.meetupSpot.split(' ').slice(0, 2).join(' ')} ·{' '}
          {shortDate(order.meetupAt)}
        </span>
        {perspective === 'seller' && order.status === 'completed' && (
          <span className="badge green">You earn {peso(order.subtotal - order.commission)}</span>
        )}
      </div>

      <div className="order-actions">
        {order.status === 'pending' && perspective === 'seller' && (
          <>
            <button className="btn sm primary" onClick={onConfirm}>
              <Check size={13} /> Confirm order
            </button>
            <button className="btn sm soft" onClick={onCancel}>
              Decline
            </button>
          </>
        )}
        {order.status === 'pending' && perspective === 'buyer' && (
          <button className="btn sm soft" onClick={onCancel}>
            Cancel order
          </button>
        )}
        {order.status === 'confirmed' && perspective === 'seller' && (
          <button className="btn sm primary" onClick={onComplete}>
            <PackageCheck size={13} /> Mark completed
          </button>
        )}
        {order.status === 'confirmed' && perspective === 'buyer' && (
          <>
            <button className="btn sm primary" onClick={onComplete}>
              <Check size={13} /> Confirm received
            </button>
            <button className="btn sm soft" onClick={onCancel}>
              Cancel
            </button>
          </>
        )}
        {order.status === 'completed' && perspective === 'buyer' && !order.rated && (
          <button className="btn sm gold" onClick={onRate}>
            <Star size={13} /> Rate seller
          </button>
        )}
        <button className="btn sm soft" onClick={onMessage}>
          <MessageCircle size={13} /> Message
        </button>
        <button className="btn sm ghost" onClick={onOpen}>
          Details <ChevronRight size={13} />
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ cancel sheet */

function CancelSheet({
  order,
  onClose,
  onConfirm,
}: {
  order: Order | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [details, setDetails] = useState('');
  const finalReason = details.trim() ? `${reason} — ${details.trim()}` : reason;

  return (
    <Sheet
      open={Boolean(order)}
      onClose={onClose}
      title="Cancel this order?"
      subtitle="Cancelled orders do not earn a CampuSmart commission."
    >
      <div className="form-alert info">
        <RotateCcw size={15} style={{ marginTop: 1, flex: '0 0 auto' }} />
        <span>
          Both parties will be notified. If payment was already sent, agree on the return of funds
          directly and keep proof of payment.
        </span>
      </div>
      <div className="field">
        <label className="label" htmlFor="cancel-reason">
          Reason
        </label>
        <div className="select-wrap">
          <select
            id="cancel-reason"
            className="select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {CANCEL_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="cancel-details">
          More details <span className="opt">optional</span>
        </label>
        <textarea
          id="cancel-details"
          className="textarea"
          style={{ minHeight: 80 }}
          placeholder="Let the other party know what happened…"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>
      <button className="btn danger block lg" onClick={() => onConfirm(finalReason)}>
        Confirm cancellation
      </button>
      <button className="btn ghost block" style={{ marginTop: 4 }} onClick={onClose}>
        Keep order
      </button>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ detail */

export function OrderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, currentUser, updateOrderStatus, startOrderConversation } = useApp();
  const { toast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  const order = state.orders.find((o) => o.id === id);
  const isParticipant =
    Boolean(order) &&
    Boolean(currentUser) &&
    (order!.buyerId === currentUser!.id || order!.sellerId === currentUser!.id);
  if (!order || !currentUser || !isParticipant) {
    return (
      <div className="screen">
        <PageHeader title="Order details" />
        <EmptyState
          icon={<PackageOpen size={30} />}
          title="Order not found"
          body="This transaction may have been removed."
          action="Back to orders"
          onAction={() => navigate('/orders')}
        />
      </div>
    );
  }

  const isBuyer = order.buyerId === currentUser.id;
  const other = state.users.find((u) => u.id === (isBuyer ? order.sellerId : order.buyerId));
  const seller = state.users.find((u) => u.id === order.sellerId);
  const payout = Math.round((order.subtotal - order.commission) * 100) / 100;

  const statusMeta = {
    pending: {
      icon: <Clock3 size={26} />,
      title: 'Waiting for confirmation',
      body: isBuyer
        ? 'The seller will review your order and confirm the meetup.'
        : 'Review the order and confirm the meetup with the buyer.',
      bg: 'linear-gradient(145deg, #fbf3d2, #fffdf6)',
      border: '#dcd2b8',
      color: '#8e2d5a',
    },
    confirmed: {
      icon: <PackageCheck size={26} />,
      title: 'Meetup confirmed',
      body: `${isBuyer ? 'Meet the seller' : 'Meet the buyer'} at ${order.meetupSpot} on ${dateTime(order.meetupAt)}.`,
      bg: 'linear-gradient(145deg, #eef2f7, #fffdf6)',
      border: '#d8d9f5',
      color: '#2d2fbf',
    },
    completed: {
      icon: <CheckCircle2 size={26} />,
      title: 'Transaction complete',
      body: isBuyer
        ? 'Thanks for trading on campus. Rate the seller to help the community.'
        : 'Commission has been recorded. Your payout is shown below.',
      bg: 'linear-gradient(145deg, #e8e9fa, #f7f8ff)',
      border: '#d8d9f5',
      color: 'var(--success)',
    },
    cancelled: {
      icon: <XCircle size={26} />,
      title: 'Order cancelled',
      body: 'No commission was charged. If payment was sent, arrange the refund directly.',
      bg: 'linear-gradient(145deg, #f8f3e3, #f8f3e3)',
      border: 'var(--line)',
      color: 'var(--muted)',
    },
  }[order.status];

  return (
    <div className="screen">
      <PageHeader
        title="Order details"
        subtitle={`#${order.id.slice(-7).toUpperCase()} · ${shortDate(order.createdAt)}`}
        backTo="/orders"
      />

      <div className="page">
        <div
          className="card"
          style={{ padding: 16, background: statusMeta.bg, borderColor: statusMeta.border }}
        >
          <div className="row start" style={{ gap: 12 }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 15,
                background: '#fff',
                color: statusMeta.color,
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
                boxShadow: '0 2px 8px rgba(16,31,49,0.06)',
              }}
            >
              {statusMeta.icon}
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>
                {statusMeta.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, lineHeight: 1.5 }}>
                {statusMeta.body}
              </div>
            </div>
          </div>

          <div className="order-actions" style={{ marginTop: 13 }}>
            {order.status === 'pending' && !isBuyer && (
              <button
                className="btn sm primary"
                onClick={() => {
                  updateOrderStatus(order.id, 'confirmed');
                  toast('Order confirmed.', 'success');
                }}
              >
                <Check size={13} /> Confirm order
              </button>
            )}
            {order.status === 'confirmed' && (
              <button
                className="btn sm primary"
                onClick={() => {
                  updateOrderStatus(order.id, 'completed');
                  toast('Transaction marked complete.', 'success');
                }}
              >
                <PackageCheck size={13} />
                {isBuyer ? 'Confirm received' : 'Mark completed'}
              </button>
            )}
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <button className="btn sm soft" onClick={() => setCancelOpen(true)}>
                Cancel
              </button>
            )}
            {order.status === 'completed' && isBuyer && !order.rated && (
              <button className="btn sm gold" onClick={() => setRateOpen(true)}>
                <Star size={13} /> Rate seller
              </button>
            )}
            <button
              className="btn sm soft"
              onClick={() => {
                const cid = startOrderConversation(order.id);
                if (cid) navigate(`/chat/${cid}`);
              }}
            >
              <MessageCircle size={13} /> Message {isBuyer ? 'seller' : 'buyer'}
            </button>
          </div>
        </div>

        <div className="timeline" style={{ margin: '18px 0 4px' }}>
          <div className="tl-item done">
            <span className="tl-dot">
              <Check size={11} />
            </span>
            <div>
              <div className="t">Order placed</div>
              <div className="d">{dateTime(order.createdAt)} · {order.payment}</div>
            </div>
          </div>
          <div className={`tl-item ${order.status !== 'pending' ? 'done' : 'current'}`}>
            <span className="tl-dot">{order.status !== 'pending' ? <Check size={11} /> : <Clock3 size={11} />}</span>
            <div>
              <div className="t">Seller confirmation</div>
              <div className="d">
                {order.status === 'pending' ? 'Awaiting seller response' : 'Meetup agreed by both parties'}
              </div>
            </div>
          </div>
          <div className={`tl-item ${order.status === 'completed' ? 'done' : order.status === 'cancelled' ? '' : 'current'}`}>
            <span className="tl-dot">
              {order.status === 'completed' ? <Check size={11} /> : order.status === 'cancelled' ? <X size={11} /> : '3'}
            </span>
            <div>
              <div className="t">{order.status === 'cancelled' ? 'Cancelled' : 'Meetup & completion'}</div>
              <div className="d">
                {order.status === 'cancelled'
                  ? order.cancelReason ?? 'Order cancelled'
                  : order.status === 'completed'
                    ? `Completed · ${dateTime(order.meetupAt)}`
                    : `${dateTime(order.meetupAt)} · ${order.meetupSpot}`}
              </div>
            </div>
          </div>
        </div>

        <div className="card pad" style={{ marginTop: 4 }}>
          {order.lines.map((line) => (
            <button
              className="order-line"
              key={line.listingId}
              style={{ width: '100%', textAlign: 'left', marginBottom: 10 }}
              onClick={() => navigate(`/product/${line.listingId}`)}
            >
              <img src={line.image} alt="" />
              <div className="grow">
                <div className="t">{line.title}</div>
                <div className="s">
                  {line.type === 'rent'
                    ? `${peso(line.price)} / day × ${line.rentalDays} days`
                    : `${line.qty} × ${peso(line.price)}`}{' '}
                  · {typeLabel[line.type]}
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800 }}>
                {peso(
                  line.type === 'rent' ? line.price * (line.rentalDays ?? 1) : line.price * line.qty,
                )}
              </span>
            </button>
          ))}
          <div className="divider" style={{ margin: '4px 0 8px' }} />
          <div className="summary-row">
            <span>{order.lines[0]?.type === 'rent' ? 'Rental fee' : 'Item subtotal'}</span>
            <strong>{peso(order.subtotal)}</strong>
          </div>
          {order.deposit > 0 && (
            <div className="summary-row">
              <span>Refundable deposit</span>
              <strong>{peso(order.deposit)}</strong>
            </div>
          )}
          <div className="summary-row">
            <span>Buyer service fee</span>
            <strong style={{ color: 'var(--success)' }}>₱0</strong>
          </div>
          <div className="summary-row total">
            <span>{order.status === 'completed' ? 'Total paid' : 'Total due at meetup'}</span>
            <strong>{peso(order.total)}</strong>
          </div>
        </div>

        {order.lines[0]?.type === 'rent' && order.rentalStart && (
          <div className="inset" style={{ marginTop: 10 }}>
            <div className="row between">
              <span className="row tiny bold" style={{ gap: 5 }}>
                <RotateCcw size={12} /> Rental period
              </span>
              <span className="tiny bold">
                {shortDate(order.rentalStart)} –{' '}
                {shortDate(addDays(new Date(order.rentalStart), order.rentalDays ?? 1).toISOString())}
              </span>
            </div>
            <p className="tiny muted" style={{ marginTop: 5, lineHeight: 1.5 }}>
              Refundable deposit of {peso(order.deposit)} is returned after the seller inspects the
              item. Late returns or damage may be charged under the agreed terms.
            </p>
          </div>
        )}

        {order.status === 'completed' && (
          <div className="fee-box" style={{ marginTop: 12 }}>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
              {isBuyer ? 'Seller settlement' : 'Your payout'}
            </div>
            <div className="row between">
              <span className="k">{isBuyer ? 'Seller subtotal' : 'Transaction subtotal'}</span>
              <span className="v">{peso(order.subtotal)}</span>
            </div>
            <div className="row between">
              <span className="k">CampuSmart commission (5%)</span>
              <span className="v">−{peso(order.commission)}</span>
            </div>
            <div className="row between total">
              <span className="k" style={{ color: '#fff' }}>
                {isBuyer ? 'Seller receives' : 'You receive'}
              </span>
              <span className="v">{peso(payout)}</span>
            </div>
            <p className="tiny" style={{ color: 'rgba(255,255,255,0.45)', marginTop: 7, lineHeight: 1.45 }}>
              {isBuyer
                ? 'CampuSmart’s 5% fee is deducted from the seller’s payout. You pay no buyer fees.'
                : 'Commission is only charged on completed transactions. Cancelled orders earn no fee.'}
            </p>
          </div>
        )}

        <h3 className="h3" style={{ margin: '18px 0 8px' }}>
          Meetup & payment
        </h3>
        <div className="card pad">
          <div className="row start" style={{ gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--teal-100)',
                color: 'var(--teal-700)',
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
              }}
            >
              <MapPin size={16} />
            </span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 750 }}>{order.meetupSpot}</div>
              <div className="tiny muted" style={{ marginTop: 1 }}>
                {dateTime(order.meetupAt)}
              </div>
            </div>
          </div>
          <div className="row between" style={{ fontSize: 11.5, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <span className="muted">Payment method</span>
            <span style={{ fontWeight: 700 }}>{order.payment}</span>
          </div>
          {order.notes && (
            <div className="inset" style={{ marginTop: 9 }}>
              <div className="tiny muted" style={{ fontWeight: 700, marginBottom: 2 }}>
                Note
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.5 }}>{order.notes}</div>
            </div>
          )}
        </div>

        {other && (
          <button
            className="seller-row"
            style={{ marginTop: 12 }}
            onClick={() => navigate(`/seller/${other.id}`)}
          >
            <Avatar user={other} />
            <div className="grow">
              <div className="name">
                {other.name}
                {other.verified && <VerifiedMark />}
              </div>
              <div className="sub">
                {isBuyer ? 'Seller' : 'Buyer'} · {other.department.replace('College of ', '')}
              </div>
            </div>
            <ChevronRight size={17} style={{ color: 'var(--muted-2)' }} />
          </button>
        )}

        <div className="inset" style={{ marginTop: 12 }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="row tiny bold" style={{ gap: 5 }}>
              <Receipt size={12} /> Receipt
            </span>
            <span className="tiny muted">Order #{order.id.slice(-7).toUpperCase()}</span>
          </div>
          <div className="row between" style={{ fontSize: 10.5, color: 'var(--muted)' }}>
            <span>{shortDate(order.createdAt)}</span>
            <span>{order.lines.length} item(s) · {order.payment}</span>
          </div>
        </div>

        <button
          className="row"
          style={{ margin: '16px auto 0', color: 'var(--muted)', fontSize: 10.5, gap: 5 }}
          onClick={() => navigate('/policies/refunds')}
        >
          <ShieldCheck size={12} /> Cancellation & refund policy
        </button>
      </div>

      <CancelSheet
        order={cancelOpen ? order : null}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => {
          updateOrderStatus(order.id, 'cancelled', reason);
          setCancelOpen(false);
          toast('Order cancelled. No commission will be charged.', 'success');
        }}
      />

      {seller && (
        <RatingSheet
          open={rateOpen}
          onClose={() => setRateOpen(false)}
          orderId={order.id}
          sellerName={seller.name}
        />
      )}
    </div>
  );
}
