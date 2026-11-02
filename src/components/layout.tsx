import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Home,
  MessageCircle,
  Plus,
  ShoppingBag,
  User as UserIcon,
  Bell,
} from 'lucide-react';
import { useApp } from '../store';

const TABS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/sell', label: 'Sell', icon: Plus, fab: true },
  { to: '/messages', label: 'Chats', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    ['main-scroll', 'flow-scroll'].forEach((id) => {
      document.getElementById(id)?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    });
  }, [pathname]);
  return null;
}

export function BottomNav() {
  const { state, currentUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const unread = currentUser
    ? state.conversations.filter(
        (c) =>
          (c.buyerId === currentUser.id || c.sellerId === currentUser.id) &&
          c.messages.some((m) => m.senderId !== currentUser.id && !m.read),
      ).length
    : 0;

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active =
          location.pathname === tab.to ||
          (tab.to === '/profile' &&
            ['/settings', '/saved', '/notifications', '/seller', '/admin'].some((p) =>
              location.pathname.startsWith(p),
            ));
        if (tab.fab) {
          return (
            <button
              key={tab.to}
              className={`nav-fab-wrap ${active ? 'active' : ''}`}
              onClick={() => navigate('/sell')}
              aria-label="Sell an item"
              style={{ background: 'none' }}
            >
              <span className="nav-fab">
                <Icon size={25} strokeWidth={2.4} />
              </span>
              <span>{tab.label}</span>
            </button>
          );
        }
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`nav-item ${active ? 'active' : ''}`}
          >
            <Icon />
            <span>{tab.label}</span>
            {tab.to === '/messages' && unread > 0 && (
              <span className="nav-badge">{unread}</span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function MainLayout() {
  const { currentUser } = useApp();
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <div className="app-scroll" id="main-scroll" ref={ref}>
        <Outlet />
      </div>
      {currentUser && <BottomNav />}
    </div>
  );
}

export function PlainLayout() {
  return (
    <div className="app-shell">
      <Outlet />
    </div>
  );
}

export function FlowLayout() {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <div className="app-scroll" id="flow-scroll" ref={ref}>
        <Outlet />
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { notifications } = useApp();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <button
      className="icon-btn"
      onClick={() => navigate('/notifications')}
      aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      style={{ position: 'relative' }}
    >
      <Bell size={20} />
      {unread > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            borderRadius: 999,
            background: 'var(--danger)',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            display: 'grid',
            placeItems: 'center',
            padding: '0 4px',
            border: '2px solid var(--bg)',
          }}
        >
          {unread}
        </span>
      )}
    </button>
  );
}

export function CartButton() {
  const { cart } = useApp();
  const navigate = useNavigate();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  return (
    <button
      className="icon-btn"
      onClick={() => navigate('/cart')}
      aria-label={`Shopping cart${count ? `, ${count} items` : ', empty'}`}
      style={{ position: 'relative' }}
    >
      <ShoppingBag size={20} />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: 3,
            right: 3,
            minWidth: 17,
            height: 17,
            borderRadius: 999,
            background: 'var(--gold-500)',
            color: 'var(--navy-900)',
            fontSize: 9,
            fontWeight: 900,
            display: 'grid',
            placeItems: 'center',
            padding: '0 4px',
            border: '2px solid var(--bg)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
