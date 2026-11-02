import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppState,
  Boost,
  CartItem,
  Listing,
  ListingType,
  Message,
  Order,
  OrderStatus,
  PaymentMethod,
  Report,
  ReportStatus,
  User,
} from './types';
import { buildInitialState } from './data/seed';

const STORAGE_KEY = 'campussmart.state.v1';

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const round2 = (n: number) => Math.round(n * 100) / 100;

const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.users)) {
      return buildInitialState();
    }
    return parsed;
  } catch {
    return buildInitialState();
  }
};

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  department: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
  pending?: boolean;
}

interface CreateListingInput {
  title: string;
  description: string;
  category: Listing['category'];
  type: ListingType;
  price: number;
  rentalPerDay?: number;
  deposit?: number;
  condition: Listing['condition'];
  image: string;
  meetupSpots: string[];
  terms?: string;
}

interface CheckoutInput {
  meetupSpot: string;
  meetupAt: string;
  payment: PaymentMethod;
  notes?: string;
}
interface RentalInput extends CheckoutInput {
  listingId: string;
  rentalStart: string;
  rentalDays: number;
}

interface AppContextValue {
  state: AppState;
  currentUser: User | null;
  pendingUserId: string | null;
  cart: CartItem[];
  favoriteIds: string[];
  notifications: AppState['notifications'];
  login: (email: string, password: string) => ActionResult;
  loginAs: (userId: string) => ActionResult;
  logout: () => void;
  register: (input: RegisterInput) => ActionResult & { userId?: string };
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  approveAndLogin: (userId: string) => void;
  addToCart: (listingId: string) => void;
  updateCartQty: (listingId: string, qty: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  toggleFavorite: (listingId: string) => void;
  placeOrder: (input: CheckoutInput & { listingId: string; qty?: number }) => string | null;
  placeCartOrders: (input: CheckoutInput) => string[];
  placeRental: (input: RentalInput) => string | null;
  updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  rateOrder: (orderId: string, stars: number, comment: string) => void;
  createListing: (input: CreateListingInput) => string;
  updateListing: (id: string, patch: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  boostListing: (listingId: string, days: number, payment: PaymentMethod) => Boost | null;
  startConversation: (listingId: string) => string;
  startConversationWith: (otherUserId: string, listingId?: string) => string;
  startOrderConversation: (orderId: string) => string;
  sendMessage: (conversationId: string, text: string) => void;
  markConversationRead: (conversationId: string) => void;
  reportContent: (input: {
    listingId?: string;
    targetUserId?: string;
    reason: string;
    details: string;
  }) => void;
  resolveReport: (reportId: string, status: ReportStatus, removeListing?: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (patch: Partial<User>) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in private mode; the demo still works in memory.
    }
  }, [state]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const cart = useMemo(
    () => (currentUser ? state.carts[currentUser.id] ?? [] : []),
    [state.carts, currentUser],
  );

  const favoriteIds = useMemo(
    () => (currentUser ? state.favorites[currentUser.id] ?? [] : []),
    [state.favorites, currentUser],
  );

  const notifications = useMemo(
    () =>
      currentUser
        ? [...state.notifications]
            .filter((n) => n.userId === currentUser.id)
            .sort((a, b) => +new Date(b.at) - +new Date(a.at))
        : [],
    [state.notifications, currentUser],
  );

  const notify = (
    s: AppState,
    userId: string,
    n: Omit<AppState['notifications'][number], 'id' | 'userId' | 'at' | 'read'>,
  ): AppState['notifications'] => [
    {
      id: uid('n'),
      userId,
      at: new Date().toISOString(),
      read: false,
      ...n,
    },
    ...s.notifications,
  ];

  const login = useCallback(
    (email: string, password: string): ActionResult => {
      const user = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!user || user.password !== password) {
        return { ok: false, error: 'Incorrect email or password. Please try again.' };
      }
      if (user.status === 'pending') {
        setState((s) => ({ ...s, pendingUserId: user.id }));
        return {
          ok: false,
          pending: true,
          error: 'Your account is still under review. Verification may take up to 24 hours.',
        };
      }
      if (user.status === 'rejected') {
        return {
          ok: false,
          error:
            'Your registration could not be verified. Contact the Student Affairs Office for help.',
        };
      }
      setState((s) => ({ ...s, currentUserId: user.id, pendingUserId: null }));
      return { ok: true };
    },
    [state.users],
  );

  const loginAs = useCallback(
    (userId: string): ActionResult => {
      const user = state.users.find((u) => u.id === userId);
      if (!user) return { ok: false, error: 'Account not found.' };
      if (user.status === 'pending') {
        setState((s) => ({ ...s, pendingUserId: user.id }));
        return { ok: false, pending: true, error: 'Account is still pending review.' };
      }
      if (user.status === 'rejected') {
        return { ok: false, error: 'This account was rejected.' };
      }
      setState((s) => ({ ...s, currentUserId: user.id, pendingUserId: null }));
      return { ok: true };
    },
    [state.users],
  );

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUserId: null }));
  }, []);

  const register = useCallback(
    (input: RegisterInput): ActionResult & { userId?: string } => {
      const email = input.email.trim().toLowerCase();
      if (!email.endsWith('@mcl.edu.ph')) {
        return { ok: false, error: 'Please use your @mcl.edu.ph institutional email address.' };
      }
      if (state.users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, error: 'An account with this email already exists. Try logging in.' };
      }
      const newUser: User = {
        id: uid('u'),
        name: input.name.trim(),
        email,
        password: input.password,
        role: input.role,
        department: input.department,
        status: 'pending',
        verified: false,
        rating: 0,
        reviewCount: 0,
        joined: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        hue: Math.floor(Math.random() * 360),
        bio:
          input.role === 'faculty'
            ? 'Faculty member of Mapúa Malayan Colleges Laguna.'
            : 'Student at Mapúa Malayan Colleges Laguna.',
        biometricEnabled: false,
      };
      setState((s) => ({
        ...s,
        users: [...s.users, newUser],
        pendingUserId: newUser.id,
        notifications: notify(s, 'u9', {
          kind: 'verify',
          title: 'New verification request',
          body: `${newUser.name} (${newUser.email}) submitted an account for review.`,
          href: '/admin',
        }),
      }));
      return { ok: true, userId: newUser.id };
    },
    [state.users],
  );

  const approveUser = useCallback((userId: string) => {
    setState((s) => {
      const user = s.users.find((u) => u.id === userId);
      if (!user) return s;
      return {
        ...s,
        users: s.users.map((u) =>
          u.id === userId ? { ...u, status: 'verified', verified: true } : u,
        ),
        notifications: notify(s, userId, {
          kind: 'verify',
          title: 'Account verified',
          body: 'Your institutional email was confirmed. You can now buy, sell, rent, and borrow on campus.',
          href: '/home',
        }),
      };
    });
  }, []);

  const approveAndLogin = useCallback((userId: string) => {
    setState((s) => {
      const user = s.users.find((u) => u.id === userId);
      if (!user) return s;
      return {
        ...s,
        currentUserId: userId,
        pendingUserId: null,
        users: s.users.map((u) =>
          u.id === userId ? { ...u, status: 'verified', verified: true } : u,
        ),
        notifications: notify(s, userId, {
          kind: 'verify',
          title: 'Account verified',
          body: 'Your institutional email was confirmed. Welcome to the campus marketplace.',
          href: '/home',
        }),
      };
    });
  }, []);

  const rejectUser = useCallback((userId: string) => {
    setState((s) => {
      const user = s.users.find((u) => u.id === userId);
      if (!user) return s;
      return {
        ...s,
        users: s.users.map((u) => (u.id === userId ? { ...u, status: 'rejected' } : u)),
        notifications: notify(s, userId, {
          kind: 'verify',
          title: 'Verification unsuccessful',
          body: 'We could not confirm your campus affiliation. Visit the Student Affairs Office for assistance.',
          href: '/login',
        }),
      };
    });
  }, []);

  const addToCart = useCallback(
    (listingId: string) => {
      if (!currentUser) return;
      const listing = state.listings.find((l) => l.id === listingId);
      if (!listing || listing.sellerId === currentUser.id) return;
      setState((s) => {
        const current = s.carts[currentUser.id] ?? [];
        const existing = current.find((c) => c.listingId === listingId);
        const next = existing
          ? current.map((c) =>
              c.listingId === listingId ? { ...c, qty: c.qty + 1 } : c,
            )
          : [...current, { listingId, qty: 1 }];
        return { ...s, carts: { ...s.carts, [currentUser.id]: next } };
      });
    },
    [currentUser, state.listings],
  );

  const updateCartQty = useCallback(
    (listingId: string, qty: number) => {
      if (!currentUser) return;
      setState((s) => {
        const current = s.carts[currentUser.id] ?? [];
        const next =
          qty <= 0
            ? current.filter((c) => c.listingId !== listingId)
            : current.map((c) => (c.listingId === listingId ? { ...c, qty } : c));
        return { ...s, carts: { ...s.carts, [currentUser.id]: next } };
      });
    },
    [currentUser],
  );

  const removeFromCart = useCallback(
    (listingId: string) => {
      if (!currentUser) return;
      setState((s) => ({
        ...s,
        carts: {
          ...s.carts,
          [currentUser.id]: (s.carts[currentUser.id] ?? []).filter(
            (c) => c.listingId !== listingId,
          ),
        },
      }));
    },
    [currentUser],
  );

  const clearCart = useCallback(() => {
    if (!currentUser) return;
    setState((s) => ({ ...s, carts: { ...s.carts, [currentUser.id]: [] } }));
  }, [currentUser]);

  const toggleFavorite = useCallback(
    (listingId: string) => {
      if (!currentUser) return;
      setState((s) => {
        const current = s.favorites[currentUser.id] ?? [];
        const next = current.includes(listingId)
          ? current.filter((id) => id !== listingId)
          : [...current, listingId];
        return { ...s, favorites: { ...s.favorites, [currentUser.id]: next } };
      });
    },
    [currentUser],
  );

  const placeOrder = useCallback(
    (input: CheckoutInput & { listingId: string; qty?: number }): string | null => {
      if (!currentUser) return null;
      const listing = state.listings.find((l) => l.id === input.listingId);
      if (!listing || listing.sellerId === currentUser.id) return null;
      const qty = input.qty ?? 1;
      const subtotal = round2(listing.price * qty);
      const deposit = listing.type === 'sell' ? 0 : listing.deposit ?? 0;
      const commission = round2(subtotal * 0.05);
      const order: Order = {
        id: uid('o'),
        buyerId: currentUser.id,
        sellerId: listing.sellerId,
        lines: [
          {
            listingId: listing.id,
            title: listing.title,
            image: listing.image,
            price: listing.price,
            qty,
            type: listing.type,
          },
        ],
        subtotal,
        deposit,
        commission,
        total: round2(subtotal + deposit),
        status: 'pending',
        meetupSpot: input.meetupSpot,
        meetupAt: input.meetupAt,
        payment: input.payment,
        createdAt: new Date().toISOString(),
        notes: input.notes,
      };
      setState((s) => ({
        ...s,
        orders: [order, ...s.orders],
        notifications: notify(s, listing.sellerId, {
          kind: 'order',
          title: 'New order received',
          body: `${currentUser.name} placed an order for “${listing.title}”.`,
          href: `/order/${order.id}`,
        }),
      }));
      return order.id;
    },
    [currentUser, state.listings],
  );

  const placeCartOrders = useCallback(
    (input: CheckoutInput): string[] => {
      if (!currentUser) return [];
      const items = state.carts[currentUser.id] ?? [];
      const bySeller = new Map<string, CartItem[]>();
      for (const item of items) {
        const listing = state.listings.find((l) => l.id === item.listingId);
        if (!listing || listing.sellerId === currentUser.id) continue;
        const group = bySeller.get(listing.sellerId) ?? [];
        group.push(item);
        bySeller.set(listing.sellerId, group);
      }
      if (!bySeller.size) return [];

      const created: Order[] = [];
      const notifications = [] as AppState['notifications'];
      for (const [sellerId, group] of bySeller) {
        const lines = group.flatMap((item) => {
          const listing = state.listings.find((l) => l.id === item.listingId);
          if (!listing) return [];
          return [
            {
              listingId: listing.id,
              title: listing.title,
              image: listing.image,
              price: listing.price,
              qty: item.qty,
              type: listing.type,
            },
          ];
        });
        const subtotal = round2(lines.reduce((sum, l) => sum + l.price * l.qty, 0));
        const commission = round2(subtotal * 0.05);
        const order: Order = {
          id: uid('o'),
          buyerId: currentUser.id,
          sellerId,
          lines,
          subtotal,
          deposit: 0,
          commission,
          total: subtotal,
          status: 'pending',
          meetupSpot: input.meetupSpot,
          meetupAt: input.meetupAt,
          payment: input.payment,
          createdAt: new Date().toISOString(),
          notes: input.notes,
        };
        created.push(order);
        notifications.push({
          id: uid('n'),
          userId: sellerId,
          title: 'New order received',
          body: `${currentUser.name} placed an order with ${lines.length} item${
            lines.length > 1 ? 's' : ''
          }.`,
          at: new Date().toISOString(),
          read: false,
          kind: 'order',
          href: `/order/${order.id}`,
        });
      }
      setState((s) => ({
        ...s,
        orders: [...created, ...s.orders],
        carts: { ...s.carts, [currentUser.id]: [] },
        notifications: [...notifications, ...s.notifications],
      }));
      return created.map((o) => o.id);
    },
    [currentUser, state.carts, state.listings],
  );

  const placeRental = useCallback(
    (input: RentalInput): string | null => {
      if (!currentUser) return null;
      const listing = state.listings.find((l) => l.id === input.listingId);
      if (!listing || listing.sellerId === currentUser.id) return null;
      const days = Math.max(1, input.rentalDays);
      const subtotal =
        listing.type === 'rent' ? round2((listing.rentalPerDay ?? 0) * days) : 0;
      const deposit = listing.deposit ?? 0;
      const commission = round2(subtotal * 0.05);
      const order: Order = {
        id: uid('o'),
        buyerId: currentUser.id,
        sellerId: listing.sellerId,
        lines: [
          {
            listingId: listing.id,
            title: listing.title,
            image: listing.image,
            price: listing.type === 'rent' ? listing.rentalPerDay ?? 0 : 0,
            qty: 1,
            type: listing.type,
            rentalDays: days,
          },
        ],
        subtotal,
        deposit,
        commission,
        total: round2(subtotal + deposit),
        status: 'pending',
        meetupSpot: input.meetupSpot,
        meetupAt: input.meetupAt,
        payment: input.payment,
        createdAt: new Date().toISOString(),
        notes: input.notes,
        rentalStart: input.rentalStart,
        rentalDays: days,
      };
      setState((s) => ({
        ...s,
        orders: [order, ...s.orders],
        notifications: notify(s, listing.sellerId, {
          kind: 'order',
          title: listing.type === 'rent' ? 'New rental request' : 'New borrow request',
          body: `${currentUser.name} requested “${listing.title}” for ${days} day${
            days > 1 ? 's' : ''
          }.`,
          href: `/order/${order.id}`,
        }),
      }));
      return order.id;
    },
    [currentUser, state.listings],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, reason?: string) => {
      setState((s) => {
        const order = s.orders.find((o) => o.id === orderId);
        if (!order || !currentUser) return s;
        if (order.buyerId !== currentUser.id && order.sellerId !== currentUser.id) return s;
        const counterpart = currentUser.id === order.sellerId ? order.buyerId : order.sellerId;
        const label =
          status === 'confirmed'
            ? 'Order confirmed'
            : status === 'completed'
              ? 'Transaction completed'
              : status === 'cancelled'
                ? 'Order cancelled'
                : 'Order updated';
        let notifications = notify(s, counterpart, {
          kind: 'order',
          title: label,
          body:
            status === 'completed'
              ? `“${order.lines[0]?.title ?? 'Your item'}” was marked as completed. Leave a rating when you can.`
              : status === 'cancelled'
                ? `“${order.lines[0]?.title ?? 'Your order'}” was cancelled${
                    reason ? `: ${reason}` : '.'
                  }`
                : `“${order.lines[0]?.title ?? 'Your order'}” is now ${status}.`,
          href: `/order/${order.id}`,
        });
        if (status === 'cancelled') {
          notifications = notify(
            { ...s, notifications },
            order.buyerId,
            {
              kind: 'order',
              title: 'Commission not charged',
              body: 'Cancelled orders do not earn a CampuSmart commission.',
              href: `/order/${order.id}`,
            },
          );
        }
        return {
          ...s,
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status, cancelReason: reason ?? o.cancelReason } : o,
          ),
          notifications,
        };
      });
    },
    [currentUser],
  );

  const rateOrder = useCallback(
    (orderId: string, stars: number, comment: string) => {
      if (!currentUser) return;
      setState((s) => {
        const order = s.orders.find((o) => o.id === orderId);
        if (!order || order.buyerId !== currentUser.id) return s;
        const seller = s.users.find((u) => u.id === order.sellerId);
        const nextCount = (seller?.reviewCount ?? 0) + 1;
        const nextRating = seller
          ? round2((seller.rating * seller.reviewCount + stars) / nextCount)
          : stars;
        return {
          ...s,
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, rated: true } : o)),
          reviews: [
            {
              id: uid('rv'),
              sellerId: order.sellerId,
              buyerId: currentUser.id,
              orderId,
              stars,
              comment,
              at: new Date().toISOString(),
            },
            ...s.reviews,
          ],
          users: s.users.map((u) =>
            u.id === order.sellerId
              ? { ...u, rating: nextRating, reviewCount: nextCount }
              : u,
          ),
          notifications: notify(s, order.sellerId, {
            kind: 'system',
            title: `New ${stars}-star rating`,
            body: `${currentUser.name} rated your transaction${
              comment ? `: “${comment}”` : '.'
            }`,
            href: '/profile',
          }),
        };
      });
    },
    [currentUser],
  );

  const createListing = useCallback(
    (input: CreateListingInput): string => {
      if (!currentUser) return '';
      const listing: Listing = {
        ...input,
        id: uid('l'),
        sellerId: currentUser.id,
        available: true,
        createdAt: new Date().toISOString(),
        views: 0,
      };
      setState((s) => ({ ...s, listings: [listing, ...s.listings] }));
      return listing.id;
    },
    [currentUser],
  );

  const updateListing = useCallback((id: string, patch: Partial<Listing>) => {
    setState((s) => ({
      ...s,
      listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }, []);

  const deleteListing = useCallback((id: string) => {
    setState((s) => {
      const nextFavorites = Object.fromEntries(
        Object.entries(s.favorites).map(([userId, ids]) => [
          userId,
          ids.filter((x) => x !== id),
        ]),
      );
      const nextCarts = Object.fromEntries(
        Object.entries(s.carts).map(([userId, items]) => [
          userId,
          items.filter((x) => x.listingId !== id),
        ]),
      );
      return {
        ...s,
        listings: s.listings.filter((l) => l.id !== id),
        favorites: nextFavorites,
        carts: nextCarts,
      };
    });
  }, []);

  const boostListing = useCallback(
    (listingId: string, days: number, payment: PaymentMethod): Boost | null => {
      if (!currentUser) return null;
      const listing = state.listings.find((l) => l.id === listingId);
      if (!listing || listing.sellerId !== currentUser.id) return null;
      const prices: Record<number, number> = { 1: 50, 3: 150, 5: 250, 7: 350 };
      const amount = prices[days] ?? days * 50;
      const base =
        listing.boostedUntil && new Date(listing.boostedUntil) > new Date()
          ? new Date(listing.boostedUntil).getTime()
          : Date.now();
      const endsAt = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
      const boost: Boost = {
        id: uid('b'),
        listingId,
        sellerId: currentUser.id,
        days,
        amount,
        startedAt: new Date().toISOString(),
        endsAt,
        payment,
      };
      setState((s) => ({
        ...s,
        boosts: [boost, ...s.boosts],
        listings: s.listings.map((l) =>
          l.id === listingId ? { ...l, boostedUntil: endsAt } : l,
        ),
        notifications: notify(s, currentUser.id, {
          kind: 'boost',
          title: 'Post boost activated',
          body: `“${listing.title}” is boosted for ${days} day${
            days > 1 ? 's' : ''
          }. Visibility ends on ${new Date(endsAt).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
          })}. Boosting does not guarantee a sale.`,
          href: '/seller',
        }),
      }));
      return boost;
    },
    [currentUser, state.listings],
  );

  const startConversation = useCallback(
    (listingId: string): string => {
      if (!currentUser) return '';
      const listing = state.listings.find((l) => l.id === listingId);
      if (!listing) return '';
      const existing = state.conversations.find(
        (c) =>
          c.listingId === listingId &&
          (c.buyerId === currentUser.id || c.sellerId === currentUser.id),
      );
      if (existing) return existing.id;
      const conversation = {
        id: uid('c'),
        listingId,
        buyerId: currentUser.id,
        sellerId: listing.sellerId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, conversations: [conversation, ...s.conversations] }));
      return conversation.id;
    },
    [currentUser, state.conversations, state.listings],
  );

  const startConversationWith = useCallback(
    (otherUserId: string, listingId?: string): string => {
      if (!currentUser) return '';
      const existing = state.conversations.find(
        (c) =>
          (c.listingId === (listingId ?? '') || !listingId) &&
          ((c.buyerId === currentUser.id && c.sellerId === otherUserId) ||
            (c.sellerId === currentUser.id && c.buyerId === otherUserId)),
      );
      if (existing) return existing.id;
      const other = state.users.find((u) => u.id === otherUserId);
      if (!other) return '';
      const listing = listingId
        ? state.listings.find((l) => l.id === listingId)
        : undefined;
      const currentIsSeller = listing?.sellerId === currentUser.id;
      const conversation = {
        id: uid('c'),
        listingId: listingId ?? '',
        buyerId: currentIsSeller ? otherUserId : currentUser.id,
        sellerId: currentIsSeller ? currentUser.id : otherUserId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, conversations: [conversation, ...s.conversations] }));
      return conversation.id;
    },
    [currentUser, state.conversations, state.listings, state.users],
  );

  const startOrderConversation = useCallback(
    (orderId: string): string => {
      if (!currentUser) return '';
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return '';
      const listingId = order.lines[0]?.listingId ?? '';
      const existing = state.conversations.find(
        (c) =>
          c.buyerId === order.buyerId &&
          c.sellerId === order.sellerId &&
          (c.listingId === listingId || !listingId),
      );
      if (existing) return existing.id;
      const conversation = {
        id: uid('c'),
        listingId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, conversations: [conversation, ...s.conversations] }));
      return conversation.id;
    },
    [currentUser, state.conversations, state.orders],
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!currentUser || !text.trim()) return;
      const message: Message = {
        id: uid('m'),
        senderId: currentUser.id,
        text: text.trim(),
        at: new Date().toISOString(),
        read: false,
      };
      setState((s) => {
        const convo = s.conversations.find((c) => c.id === conversationId);
        if (!convo) return s;
        const other = convo.buyerId === currentUser.id ? convo.sellerId : convo.buyerId;
        return {
          ...s,
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, message], updatedAt: message.at }
              : c,
          ),
          notifications: notify(s, other, {
            kind: 'message',
            title: `New message from ${currentUser.name.split(' ')[0]}`,
            body: `“${message.text.slice(0, 90)}${message.text.length > 90 ? '…' : ''}”`,
            href: `/chat/${conversationId}`,
          }),
        };
      });
    },
    [currentUser],
  );

  const markConversationRead = useCallback(
    (conversationId: string) => {
      if (!currentUser) return;
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.senderId !== currentUser.id ? { ...m, read: true } : m,
                ),
              }
            : c,
        ),
      }));
    },
    [currentUser],
  );

  const reportContent = useCallback(
    (input: {
      listingId?: string;
      targetUserId?: string;
      reason: string;
      details: string;
    }) => {
      if (!currentUser) return;
      const report: Report = {
        id: uid('r'),
        reporterId: currentUser.id,
        ...input,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({
        ...s,
        reports: [report, ...s.reports],
        notifications: notify(s, 'u9', {
          kind: 'system',
          title: 'New marketplace report',
          body: `${currentUser.name} reported: ${input.reason}.`,
          href: '/admin',
        }),
      }));
    },
    [currentUser],
  );

  const resolveReport = useCallback(
    (reportId: string, status: ReportStatus, removeListing = false) => {
      setState((s) => {
        const report = s.reports.find((r) => r.id === reportId);
        if (!report) return s;
        let notifications = s.notifications;
        if (status === 'resolved') {
          notifications = notify(
            { ...s, notifications },
            report.reporterId,
            {
              kind: 'system',
              title: 'Report resolved',
              body: 'The moderation team reviewed your report and took action. Thank you for keeping campus safe.',
              href: '/profile',
            },
          );
        }
        return {
          ...s,
          reports: s.reports.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status,
                  resolution:
                    status === 'resolved'
                      ? removeListing
                        ? 'Listing removed by the moderation team.'
                        : 'Reviewed and resolved by the moderation team.'
                      : 'No policy violation found.',
                }
              : r,
          ),
          listings:
            removeListing && report.listingId
              ? s.listings.map((l) =>
                  l.id === report.listingId ? { ...l, available: false } : l,
                )
              : s.listings,
          notifications,
        };
      });
    },
    [],
  );

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.userId === currentUser.id ? { ...n, read: true } : n,
      ),
    }));
  }, [currentUser]);

  const updateProfile = useCallback(
    (patch: Partial<User>) => {
      if (!currentUser) return;
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === currentUser.id ? { ...u, ...patch } : u,
        ),
      }));
    },
    [currentUser],
  );

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(buildInitialState());
  }, []);

  const value: AppContextValue = {
    state,
    currentUser,
    pendingUserId: state.pendingUserId,
    cart,
    favoriteIds,
    notifications,
    login,
    loginAs,
    logout,
    register,
    approveUser,
    rejectUser,
    approveAndLogin,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleFavorite,
    placeOrder,
    placeCartOrders,
    placeRental,
    updateOrderStatus,
    rateOrder,
    createListing,
    updateListing,
    deleteListing,
    boostListing,
    startConversation,
    startConversationWith,
    startOrderConversation,
    sendMessage,
    markConversationRead,
    reportContent,
    resolveReport,
    markNotificationRead,
    markAllNotificationsRead,
    updateProfile,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export const COMMISSION_RATE = 0.05;

export const commissionFor = (subtotal: number) => round2(subtotal * COMMISSION_RATE);

export const isBoostActive = (listing: Listing) =>
  Boolean(listing.boostedUntil && new Date(listing.boostedUntil) > new Date());
