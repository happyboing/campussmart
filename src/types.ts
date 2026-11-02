export type AccountStatus = 'pending' | 'verified' | 'rejected';
export type UserRole = 'student' | 'faculty' | 'vendor' | 'admin';
export type CategoryId = 'books' | 'supplies' | 'uniforms' | 'food' | 'accessories' | 'other';
export type ListingType = 'sell' | 'rent' | 'borrow';
export type ItemCondition = 'New' | 'Like new' | 'Good' | 'Fair';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentMethod = 'Cash on meetup' | 'GCash' | 'Maya';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  status: AccountStatus;
  verified: boolean;
  rating: number;
  reviewCount: number;
  joined: string;
  bio?: string;
  badge?: string;
  hue: number;
  biometricEnabled?: boolean;
  submittedAt?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: CategoryId;
  type: ListingType;
  price: number;
  rentalPerDay?: number;
  deposit?: number;
  condition: ItemCondition;
  image: string;
  meetupSpots: string[];
  available: boolean;
  boostedUntil?: string;
  createdAt: string;
  views: number;
  terms?: string;
}

export interface CartItem {
  listingId: string;
  qty: number;
}

export interface OrderLine {
  listingId: string;
  title: string;
  image: string;
  price: number;
  qty: number;
  type: ListingType;
  rentalDays?: number;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  lines: OrderLine[];
  subtotal: number;
  deposit: number;
  commission: number;
  total: number;
  status: OrderStatus;
  meetupSpot: string;
  meetupAt: string;
  payment: PaymentMethod;
  createdAt: string;
  notes?: string;
  cancelReason?: string;
  rated?: boolean;
  rentalStart?: string;
  rentalDays?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  messages: Message[];
  updatedAt: string;
}

export interface Boost {
  id: string;
  listingId: string;
  sellerId: string;
  days: number;
  amount: number;
  startedAt: string;
  endsAt: string;
  payment: PaymentMethod;
}

export interface Report {
  id: string;
  reporterId: string;
  listingId?: string;
  targetUserId?: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  resolution?: string;
}

export interface Review {
  id: string;
  sellerId: string;
  buyerId: string;
  orderId: string;
  stars: number;
  comment: string;
  at: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: 'order' | 'boost' | 'verify' | 'message' | 'system';
  href?: string;
}

export interface AppState {
  version: number;
  users: User[];
  currentUserId: string | null;
  pendingUserId: string | null;
  listings: Listing[];
  orders: Order[];
  conversations: Conversation[];
  favorites: Record<string, string[]>;
  carts: Record<string, CartItem[]>;
  boosts: Boost[];
  reports: Report[];
  reviews: Review[];
  notifications: Notification[];
}
