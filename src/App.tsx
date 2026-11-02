import { Navigate, Outlet, Route, Routes, HashRouter, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { ToastProvider } from './components/ui';
import { Wordmark } from './components/ui';
import { MainLayout, PlainLayout, FlowLayout } from './components/layout';
import { WelcomeScreen, LoginScreen, RegisterScreen, PendingScreen } from './screens/auth';
import { HomeScreen } from './screens/home';
import { ExploreScreen } from './screens/explore';
import { ProductScreen } from './screens/product';
import { CartScreen, CheckoutScreen } from './screens/cart';
import { OrdersScreen, OrderDetailScreen } from './screens/orders';
import { MessagesScreen, ChatScreen } from './screens/messages';
import {
  ProfileScreen,
  SettingsScreen,
  NotificationsScreen,
  SavedScreen,
} from './screens/profile';
import { SellerCenterScreen, SellerProfileScreen, BoostScreen } from './screens/seller';
import { SellScreen } from './screens/sell';
import { AdminScreen } from './screens/admin';
import { PolicyScreen } from './screens/policies';

function AuthLayout() {
  return (
    <div className="app-shell">
      <div className="app-scroll">
        <Outlet />
      </div>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (currentUser.status !== 'verified') {
    return <Navigate to="/pending" replace />;
  }
  return <>{children}</>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  if (currentUser?.role !== 'admin') return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function NotFound() {
  return <Navigate to="/home" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/pending" element={<PendingScreen />} />
      </Route>

      <Route
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/explore" element={<ExploreScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/order/:id" element={<OrderDetailScreen />} />
        <Route path="/messages" element={<MessagesScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/seller" element={<SellerCenterScreen />} />
        <Route path="/seller/:id" element={<SellerProfileScreen />} />
        <Route path="/saved" element={<SavedScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/sell" element={<SellScreen />} />
        <Route
          path="/admin"
          element={
            <AdminOnly>
              <AdminScreen />
            </AdminOnly>
          }
        />
        <Route path="/policies/:slug" element={<PolicyScreen />} />
      </Route>

      <Route
        element={
          <Protected>
            <FlowLayout />
          </Protected>
        }
      >
        <Route path="/product/:id" element={<ProductScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/boost/:id" element={<BoostScreen />} />
      </Route>

      <Route
        element={
          <Protected>
            <PlainLayout />
          </Protected>
        }
      >
        <Route path="/chat/:id" element={<ChatScreen />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="stage">
          <div className="stage-brand">
            <Wordmark light height={24} />
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.34)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                padding: '3px 6px',
                marginLeft: 2,
              }}
            >
              PROTOTYPE
            </span>
          </div>
          <div className="stage-note">
            Your Campus, Your Marketplace · MMCL
          </div>
          <div className="device" id="app-device">
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </div>
        </div>
      </HashRouter>
    </AppProvider>
  );
}
