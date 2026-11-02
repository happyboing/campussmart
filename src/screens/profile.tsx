import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  RotateCcw,
  ScanFace,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Trash2,
  Wallet,
} from 'lucide-react';
import { useApp } from '../store';
import {
  Avatar,
  EmptyState,
  Logo,
  PageHeader,
  ProductCard,
  Sheet,
  useToast,
} from '../components/ui';
import { DEPARTMENTS } from '../data/catalog';
import { timeAgo } from '../lib/format';
import type { Notification } from '../types';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { CountUp } from '../components/motion';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { state, currentUser, logout, resetAll } = useApp();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!currentUser) return null;

  const myListings = state.listings.filter((l) => l.sellerId === currentUser.id);
  const mySales = state.orders.filter((o) => o.sellerId === currentUser.id && o.status === 'completed');
  const unread = state.notifications.filter(
    (n) => n.userId === currentUser.id && !n.read,
  ).length;

  const menu = [
    {
      icon: <ShoppingBag size={17} />,
      label: 'My purchases',
      sub: 'Track orders and meetups',
      onClick: () => navigate('/orders'),
    },
    {
      icon: <Store size={17} />,
      label: 'Seller Center',
      sub: `${myListings.length} listing${myListings.length === 1 ? '' : 's'} · manage sales and boosts`,
      onClick: () => navigate('/seller'),
    },
    {
      icon: <Heart size={17} />,
      label: 'Saved items',
      sub: 'Your wishlist of campus finds',
      onClick: () => navigate('/saved'),
    },
    {
      icon: <Bell size={17} />,
      label: 'Notifications',
      sub: unread ? `${unread} unread update${unread === 1 ? '' : 's'}` : 'All caught up',
      onClick: () => navigate('/notifications'),
      badge: unread > 0 ? unread : undefined,
    },
  ];

  return (
    <div className="screen flush">
      <div className="profile-hero">
        <div className="row between" style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.45)' }}>
            My account
          </span>
          <div className="row" style={{ gap: 2 }}>
            <button
              className="icon-btn light"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
            >
              <SettingsIcon size={18} />
            </button>
            <button
              className="icon-btn light"
              onClick={() => setEditOpen(true)}
              aria-label="Edit profile"
            >
              <Pencil size={17} />
            </button>
          </div>
        </div>

        <div className="row" style={{ marginTop: 14, gap: 13, position: 'relative', zIndex: 2 }}>
          <Avatar user={currentUser} size="xl" online />
          <div className="grow">
            <div className="name">{currentUser.name}</div>
            <div className="meta">
              {currentUser.role === 'admin'
                ? 'Administrator'
                : currentUser.role === 'faculty'
                  ? 'Faculty member'
                  : currentUser.role === 'vendor'
                    ? 'Approved campus vendor'
                    : 'Student'}{' '}
              · {currentUser.department}
            </div>
            <div className="row" style={{ gap: 6, marginTop: 7 }}>
              <span className="badge" style={{ background: 'rgba(45,47,191,0.16)', color: '#f7ebc6' }}>
                <BadgeCheck size={11} /> Verified @mcl.edu.ph
              </span>
              {currentUser.badge && (
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  {currentUser.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <strong>
              <CountUp value={myListings.length} />
            </strong>
            <span>Listings</span>
          </div>
          <div className="profile-stat">
            <strong>
              <CountUp value={mySales.length} />
            </strong>
            <span>Completed</span>
          </div>
          <div className="profile-stat">
            <strong className="row" style={{ gap: 3 }}>
              {currentUser.rating ? (
                <CountUp value={currentUser.rating} decimals={1} />
              ) : (
                '—'
              )}{' '}
              <Star size={13} style={{ fill: 'var(--gold-400)', color: 'var(--gold-400)' }} />
            </strong>
            <span>{currentUser.reviewCount} reviews</span>
          </div>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 16 }}>
        {currentUser.status === 'verified' ? (
          <div className="verification-banner">
            <span className="icon">
              <ShieldCheck size={18} />
            </span>
            <div className="grow">
              <div style={{ fontSize: 12, fontWeight: 800 }}>Account verified</div>
              <div style={{ fontSize: 10.5, color: '#2d2fbf', marginTop: 1 }}>
                Only verified MMCL members can see your listings and message you.
              </div>
            </div>
            <BadgeCheck size={18} style={{ color: 'var(--success)' }} />
          </div>
        ) : (
          <div className="form-alert info" style={{ marginBottom: 0 }}>
            <Clock3 size={15} style={{ marginTop: 1 }} />
            <span>Your account is still under review. Marketplace access is restricted.</span>
          </div>
        )}

        <div className="grid-2" style={{ marginTop: 12 }}>
          <button
            className="card pad"
            style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}
            onClick={() => navigate('/seller')}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--gold-100)',
                color: 'var(--gold-600)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Sparkles size={17} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 750 }}>Boost a listing</span>
            <span className="tiny muted">Reach more buyers from ₱50/day</span>
          </button>
          <button
            className="card pad"
            style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}
            onClick={() => navigate('/orders')}
          >
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--teal-100)',
                color: 'var(--teal-700)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Wallet size={17} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 750 }}>Orders & payouts</span>
            <span className="tiny muted">5% commission on completed sales</span>
          </button>
        </div>

        {currentUser.role === 'admin' && (
          <button
            className="card pad"
            style={{
              marginTop: 12,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              textAlign: 'left',
              borderColor: '#dcd2b8',
              background: '#fbf3d2',
            }}
            onClick={() => navigate('/admin')}
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
              <LayoutDashboard size={18} />
            </span>
            <span className="grow">
              <span style={{ fontSize: 12.5, fontWeight: 800, display: 'block' }}>
                Administrator dashboard
              </span>
              <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                Verification, moderation, reports, and revenue
              </span>
            </span>
            <ChevronRight size={17} style={{ color: 'var(--muted-2)' }} />
          </button>
        )}

        <div className="menu-group" style={{ marginTop: 14 }}>
          {menu.map((m) => (
            <button className="menu-item" key={m.label} onClick={m.onClick}>
              <span className="icon">{m.icon}</span>
              <span className="grow">
                <span className="label">{m.label}</span>
                <span className="sub">{m.sub}</span>
              </span>
              <span className="trail">
                {m.badge && <span className="unread-pill">{m.badge}</span>}
                <ChevronRight size={16} />
              </span>
            </button>
          ))}
        </div>

        <div className="menu-group" style={{ marginTop: 12 }}>
          <button className="menu-item" onClick={() => navigate('/settings')}>
            <span className="icon">
              <SettingsIcon size={17} />
            </span>
            <span className="grow">
              <span className="label">Settings & privacy</span>
              <span className="sub">Face ID, notifications, data controls</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button className="menu-item" onClick={() => navigate('/policies/meetups')}>
            <span className="icon">
              <MapPin size={17} />
            </span>
            <span className="grow">
              <span className="label">Safe meetup spots</span>
              <span className="sub">Yuchengco lobby, Library, Student Lounge</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button className="menu-item" onClick={() => navigate('/policies/terms')}>
            <span className="icon">
              <BookOpen size={17} />
            </span>
            <span className="grow">
              <span className="label">Terms & policies</span>
              <span className="sub">Terms, privacy, seller rules, refunds</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button className="menu-item" onClick={() => navigate('/policies/refunds')}>
            <span className="icon">
              <CircleHelp size={17} />
            </span>
            <span className="grow">
              <span className="label">Help & dispute resolution</span>
              <span className="sub">Report a problem or review refunds</span>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="menu-group" style={{ marginTop: 12 }}>
          <button
            className="menu-item"
            onClick={() => {
              logout();
              toast('Signed out. See you on campus!');
              navigate('/');
            }}
          >
            <span className="icon">
              <LogOut size={17} />
            </span>
            <span className="grow">
              <span className="label">Sign out</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button className="menu-item danger" onClick={() => setResetOpen(true)}>
            <span className="icon">
              <RotateCcw size={17} />
            </span>
            <span className="grow">
              <span className="label">Reset demo data</span>
              <span className="sub">Restore the original prototype state</span>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>

        <p className="hint center" style={{ marginTop: 16, lineHeight: 1.6 }}>
          CampuSmart v1.0 · Mapúa Malayan Colleges Laguna
          <br />
          Your Campus, Your Marketplace.
        </p>
      </div>

      <EditProfileSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        name={currentUser.name}
        bio={currentUser.bio ?? ''}
        department={currentUser.department}
      />

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data?"
        subtitle="This restores all listings, orders, messages, and demo accounts."
      >
        <div className="form-alert error">
          <RotateCcw size={15} style={{ marginTop: 1 }} />
          <span>
            Any listings, orders, reports, or messages you created in this prototype will be
            removed. This action cannot be undone.
          </span>
        </div>
        <button
          className="btn danger block lg"
          onClick={() => {
            resetAll();
            setResetOpen(false);
            navigate('/');
            toast('Demo data restored.');
          }}
        >
          Reset everything
        </button>
        <button className="btn ghost block" style={{ marginTop: 4 }} onClick={() => setResetOpen(false)}>
          Keep my data
        </button>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ edit profile */

function EditProfileSheet({
  open,
  onClose,
  name,
  bio,
  department,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  bio: string;
  department: string;
}) {
  const { updateProfile } = useApp();
  const { toast } = useToast();
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftDept, setDraftDept] = useState(department);

  useEffect(() => {
    if (open) {
      setDraftName(name);
      setDraftBio(bio);
      setDraftDept(department);
    }
  }, [open, name, bio, department]);

  const save = () => {
    if (!draftName.trim()) {
      toast('Your name cannot be empty.', 'error');
      return;
    }
    updateProfile({
      name: draftName.trim(),
      bio: draftBio.trim(),
      department: draftDept,
    });
    toast('Profile updated.', 'success');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Edit profile" subtitle="Public marketplace information">
      <div className="field">
        <label className="label" htmlFor="edit-name">
          Full name
        </label>
        <input
          id="edit-name"
          className="input"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="edit-dept">
          Department
        </label>
        <div className="select-wrap">
          <select
            id="edit-dept"
            className="select"
            value={draftDept}
            onChange={(e) => setDraftDept(e.target.value)}
          >
            {[...new Set([department, ...DEPARTMENTS])].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="edit-bio">
          Short bio <span className="opt">optional</span>
        </label>
        <textarea
          id="edit-bio"
          className="textarea"
          style={{ minHeight: 90 }}
          value={draftBio}
          onChange={(e) => setDraftBio(e.target.value)}
          placeholder="Tell buyers what you sell and where you usually meet."
        />
      </div>
      <div className="inset row" style={{ gap: 8, marginBottom: 14 }}>
        <ShieldCheck size={14} style={{ color: 'var(--teal-600)', flex: '0 0 auto' }} />
        <span className="tiny muted">
          Your email and student/staff status are verified by the administrator. Student ID numbers
          and phone numbers are never displayed.
        </span>
      </div>
      <button className="btn primary block lg" onClick={save}>
        Save changes
      </button>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ saved */

export function SavedScreen() {
  const navigate = useNavigate();
  const { state, favoriteIds } = useApp();
  const saved = state.listings.filter((l) => favoriteIds.includes(l.id));

  return (
    <div className="screen">
      <PageHeader title="Saved items" subtitle={`${saved.length} saved`} backTo="/profile" />
      {saved.length === 0 ? (
        <EmptyState
          icon={<Heart size={30} />}
          title="Nothing saved yet"
          body="Tap the heart on any listing to keep it here for later."
          action="Explore listings"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="grid-2" style={{ padding: '10px 20px 20px' }}>
          {saved.map((l) => (
            <ProductCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ notifications */

export function NotificationsScreen() {
  const navigate = useNavigate();
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();

  const iconFor = (kind: Notification['kind']) => {
    const map = {
      order: <ShoppingBag size={16} />,
      boost: <Sparkles size={16} />,
      verify: <BadgeCheck size={16} />,
      message: <MessageCircle size={16} />,
      system: <Bell size={16} />,
    };
    return map[kind];
  };

  return (
    <div className="screen">
      <PageHeader
        title="Notifications"
        backTo="/home"
        right={
          notifications.some((n) => !n.read) ? (
            <button className="btn sm soft" onClick={markAllNotificationsRead}>
              Mark all read
            </button>
          ) : undefined
        }
      />
      <div className="page tight" style={{ paddingTop: 8 }}>
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={30} />}
            title="No notifications yet"
            body="Order updates, messages, verification results, and boost reminders will appear here."
          />
        ) : (
          <div className="card pad" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {notifications.map((n) => (
              <button
                key={n.id}
                className={`notif ${n.read ? '' : 'unread'}`}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.href) navigate(n.href);
                }}
              >
                <span className={`ico ${n.kind}`}>{iconFor(n.kind)}</span>
                <span className="grow">
                  <span className="t">{n.title}</span>
                  <span className="d" style={{ display: 'block' }}>
                    {n.body}
                  </span>
                  <span className="when" style={{ display: 'block' }}>
                    {timeAgo(n.at)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
        <p className="hint center" style={{ marginTop: 14 }}>
          Verification results and order updates are also sent to your @mcl.edu.ph email.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ settings */

export function SettingsScreen() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout, resetAll } = useApp();
  const { toast } = useToast();
  const [push, setPush] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [installEvent, setInstallEvent] = useState<Event | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!currentUser) return null;

  const install = async () => {
    if (!installEvent) {
      toast('Use your browser menu and choose “Add to Home Screen”.');
      return;
    }
    const evt = installEvent as Event & { prompt?: () => Promise<void> };
    await evt.prompt?.();
    setInstallEvent(null);
  };

  return (
    <div className="screen">
      <PageHeader title="Settings & privacy" backTo="/profile" />
      <div className="page tight" style={{ paddingTop: 8 }}>
        <div className="card pad" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 11 }}>
            <Avatar user={currentUser} size="lg" />
            <div className="grow">
              <div style={{ fontSize: 14, fontWeight: 800 }}>{currentUser.name}</div>
              <div className="tiny muted" style={{ marginTop: 2 }}>
                {currentUser.email}
              </div>
              <span className="badge green" style={{ marginTop: 6 }}>
                <ShieldCheck size={10} /> Verified campus account
              </span>
            </div>
          </div>
          <button className="btn soft block sm" style={{ marginTop: 12 }} onClick={() => navigate('/profile')}>
            <Pencil size={13} /> Edit public profile
          </button>
        </div>

        <div className="eyebrow" style={{ margin: '14px 2px 7px' }}>
          Sign-in & security
        </div>
        <div className="card pad">
          <div className="toggle-row">
            <div>
              <div className="t row" style={{ gap: 5 }}>
                <ScanFace size={14} /> Face ID login
              </div>
              <div className="d">
                Sign in faster after verification. Facial data stays on your device and is never
                stored by CampuSmart.
              </div>
            </div>
            <button
              className={`switch ${currentUser.biometricEnabled ? 'on' : ''}`}
              onClick={() => {
                updateProfile({ biometricEnabled: !currentUser.biometricEnabled });
                toast(
                  currentUser.biometricEnabled
                    ? 'Face ID login disabled.'
                    : 'Face ID login enabled for this device.',
                  'success',
                );
              }}
              aria-label="Toggle Face ID login"
              aria-pressed={Boolean(currentUser.biometricEnabled)}
            />
          </div>
          <div className="toggle-row">
            <div>
              <div className="t row" style={{ gap: 5 }}>
                <Mail size={14} /> Email updates
              </div>
              <div className="d">Order, verification, and dispute updates sent to your campus inbox.</div>
            </div>
            <button
              className={`switch ${emailUpdates ? 'on' : ''}`}
              onClick={() => setEmailUpdates((v) => !v)}
              aria-label="Toggle email updates"
              aria-pressed={emailUpdates}
            />
          </div>
          <div className="toggle-row">
            <div>
              <div className="t row" style={{ gap: 5 }}>
                <Bell size={14} /> Push notifications
              </div>
              <div className="d">New messages, order updates, and boost reminders.</div>
            </div>
            <button
              className={`switch ${push ? 'on' : ''}`}
              onClick={() => setPush((v) => !v)}
              aria-label="Toggle push notifications"
              aria-pressed={push}
            />
          </div>
          <button
            className="btn soft block sm"
            style={{ marginTop: 10 }}
            onClick={() => toast('Password changes are handled by the Student Affairs Office in this pilot.')}
          >
            Change password
          </button>
        </div>

        <div className="eyebrow" style={{ margin: '16px 2px 7px' }}>
          Privacy & data
        </div>
        <div className="card pad">
          <div className="inset" style={{ marginBottom: 10 }}>
            <div className="row start" style={{ gap: 8 }}>
              <ShieldCheck size={15} style={{ color: 'var(--teal-600)', marginTop: 1, flex: '0 0 auto' }} />
              <p className="tiny muted" style={{ lineHeight: 1.55 }}>
                We collect only your name, verified @mcl.edu.ph email, department, listings, messages,
                and transactions. Student ID numbers, home addresses, and phone numbers are never
                shown publicly. Verification documents are deleted after approval.
              </p>
            </div>
          </div>
          <button
            className="menu-item"
            style={{ paddingLeft: 0, paddingRight: 0 }}
            onClick={() => toast('A copy of your data will be emailed within 72 hours.')}
          >
            <span className="icon">
              <Download size={16} />
            </span>
            <span className="grow">
              <span className="label">Request a copy of my data</span>
              <span className="sub">Delivered to your institutional email</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button
            className="menu-item"
            style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 0 }}
            onClick={() => navigate('/policies/privacy')}
          >
            <span className="icon">
              <BookOpen size={16} />
            </span>
            <span className="grow">
              <span className="label">Read the Privacy Policy</span>
              <span className="sub">RA 10173 · Data Privacy Act of 2012</span>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="eyebrow" style={{ margin: '16px 2px 7px' }}>
          App
        </div>
        <div className="card pad">
          <button className="menu-item" style={{ paddingLeft: 0, paddingRight: 0 }} onClick={install}>
            <span className="icon">
              <Download size={16} />
            </span>
            <span className="grow">
              <span className="label">Install CampuSmart</span>
              <span className="sub">Add the app to your home screen</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button
            className="menu-item"
            style={{ paddingLeft: 0, paddingRight: 0 }}
            onClick={() => navigate('/policies/terms')}
          >
            <span className="icon">
              <BookOpen size={16} />
            </span>
            <span className="grow">
              <span className="label">Terms & Conditions</span>
              <span className="sub">Buying, selling, renting, borrowing</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button
            className="menu-item"
            style={{ paddingLeft: 0, paddingRight: 0 }}
            onClick={() => setFeedbackOpen(true)}
          >
            <span className="icon">
              <MessageCircle size={16} />
            </span>
            <span className="grow">
              <span className="label">Share prototype feedback</span>
              <span className="sub">Help evaluate usability and effectiveness</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <div className="toggle-row" style={{ borderBottom: 0 }}>
            <div>
              <div className="t">Version</div>
              <div className="d">CampuSmart 1.0.0 · MMCL pilot</div>
            </div>
            <span className="badge gray">Prototype</span>
          </div>
          <button
            className="menu-item"
            style={{ paddingLeft: 0, paddingRight: 0, borderBottom: 0 }}
            onClick={() => setAboutOpen(true)}
          >
            <span className="icon">
              <BookOpen size={16} />
            </span>
            <span className="grow">
              <span className="label">About CampuSmart</span>
              <span className="sub">Mission, vision, and project credits</span>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="menu-group" style={{ marginTop: 12 }}>
          <button
            className="menu-item"
            onClick={() => {
              logout();
              navigate('/');
              toast('Signed out.');
            }}
          >
            <span className="icon">
              <LogOut size={17} />
            </span>
            <span className="grow">
              <span className="label">Sign out</span>
            </span>
            <ChevronRight size={16} />
          </button>
          <button className="menu-item danger" onClick={() => setResetOpen(true)}>
            <span className="icon">
              <Trash2 size={17} />
            </span>
            <span className="grow">
              <span className="label">Reset demo data</span>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>

        <p className="hint center" style={{ marginTop: 16, lineHeight: 1.6 }}>
          CampuSmart is a student project for ENT078/CIS201.
          <br />
          Your Campus, Your Marketplace.
        </p>
      </div>

      <Sheet
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data?"
        subtitle="All changes you made in this prototype will be removed."
      >
        <button
          className="btn danger block lg"
          onClick={() => {
            resetAll();
            setResetOpen(false);
            navigate('/');
            toast('Demo data restored.');
          }}
        >
          Reset everything
        </button>
        <button className="btn ghost block" style={{ marginTop: 4 }} onClick={() => setResetOpen(false)}>
          Cancel
        </button>
      </Sheet>

      <FeedbackSheet open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      <Sheet
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        title="About CampuSmart"
        subtitle="Your Campus, Your Marketplace."
      >
        <div className="row" style={{ gap: 11, marginBottom: 14 }}>
          <Logo size={44} />
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em' }}>
              CampuSmart
            </div>
            <div className="tiny muted">Mapúa Malayan Colleges Laguna</div>
          </div>
        </div>
        <div className="inset" style={{ marginBottom: 10 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Mission
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            To provide a convenient, accessible, and trustworthy digital marketplace that connects
            members of the educational community through buying, selling, renting, and borrowing —
            while supporting student entrepreneurship and affordable campus transactions.
          </p>
        </div>
        <div className="inset" style={{ marginBottom: 10 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Vision
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            To become a leading campus-based digital marketplace, expanding to more educational
            institutions while encouraging entrepreneurship, cooperation, and responsible
            consumption.
          </p>
        </div>
        <div className="inset">
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            Project
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
            ENT078/CIS201 · Group 1
            <br />
            Abaquin, Bermejo, Galay, Libo-on, Paiton, Yboa
            <br />
            Faculty adviser: Marthison Villanueva
          </p>
        </div>
        <p className="hint center" style={{ marginTop: 12 }}>
          Verified with @mcl.edu.ph · No delivery fees · Safe campus meetups
        </p>
        <button className="btn primary block" style={{ marginTop: 10 }} onClick={() => setAboutOpen(false)}>
          Close
        </button>
      </Sheet>
    </div>
  );
}
