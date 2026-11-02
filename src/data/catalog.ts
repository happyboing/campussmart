import {
  BookOpen,
  PencilRuler,
  Shirt,
  Coffee,
  Headphones,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId, ListingType } from '../types';

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  short: string;
  icon: LucideIcon;
  tone: string;
  image: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'books',
    name: 'Textbooks & reviewers',
    short: 'Books',
    icon: BookOpen,
    tone: 'blue',
    image: '/img/books-stack.jpg',
  },
  {
    id: 'supplies',
    name: 'School supplies & equipment',
    short: 'Supplies',
    icon: PencilRuler,
    tone: 'gold',
    image: '/img/notebook.jpg',
  },
  {
    id: 'uniforms',
    name: 'Uniforms & clothing',
    short: 'Uniforms',
    icon: Shirt,
    tone: 'rose',
    image: '/img/hoodie.jpg',
  },
  {
    id: 'food',
    name: 'Food & beverages',
    short: 'Food',
    icon: Coffee,
    tone: 'orange',
    image: '/img/coffee.jpg',
  },
  {
    id: 'accessories',
    name: 'Accessories & personal items',
    short: 'Accessories',
    icon: Headphones,
    tone: 'violet',
    image: '/img/headphones.jpg',
  },
  {
    id: 'other',
    name: 'Everyday necessities',
    short: 'Everyday',
    icon: Package,
    tone: 'teal',
    image: '/img/desk-lamp.jpg',
  },
];

export const categoryById = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const LISTING_TYPES: { id: ListingType; label: string; hint: string }[] = [
  { id: 'sell', label: 'For sale', hint: 'One-time purchase' },
  { id: 'rent', label: 'For rent', hint: 'Pay per day + deposit' },
  { id: 'borrow', label: 'For borrowing', hint: 'Free, deposit may apply' },
];

export const SAFE_SPOTS = [
  {
    id: 'yuchengco',
    name: 'ET Yuchengco Building Lobby',
    detail: 'Ground floor · well-lit · CCTV monitored',
  },
  {
    id: 'library',
    name: 'Library Entrance',
    detail: 'Main library doors · guard on duty',
  },
  {
    id: 'lounge',
    name: 'Student Lounge',
    detail: 'Near the canteen · high foot traffic',
  },
];

export const BOOST_PACKAGES = [
  { days: 1, price: 50, label: '1 day', note: 'Quick visibility' },
  { days: 3, price: 150, label: '3 days', note: 'Popular' },
  { days: 5, price: 250, label: '5 days', note: 'Best value' },
  { days: 7, price: 350, label: '7 days', note: 'Maximum reach' },
];

export const DEPARTMENTS = [
  'College of Information Technology',
  'College of Engineering',
  'College of Business',
  'College of Nursing',
  'College of Arts and Sciences',
  'College of Education',
  'Student Affairs Office',
];

export const REPORT_REASONS = [
  'Misleading or inaccurate listing',
  'Prohibited or illegal item',
  'Counterfeit product',
  'Suspicious account or scam',
  'Abusive behavior in messages',
  'Copyright or trademark issue',
  'Other concern',
];

export const POLICY_SLUGS = [
  'terms',
  'privacy',
  'seller',
  'refunds',
  'meetups',
] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export const POLICIES: Record<
  PolicySlug,
  { title: string; eyebrow: string; updated: string; sections: { heading: string; body: string[] }[] }
> = {
  terms: {
    title: 'Terms & Conditions',
    eyebrow: 'Platform agreement',
    updated: 'November 2026',
    sections: [
      {
        heading: 'Who may use CampuSmart',
        body: [
          'CampuSmart is a digital marketplace for students, faculty members, and other eligible members of the campus community who have a valid .edu.ph institutional email address. For Mapúa Malayan Colleges Laguna, registration requires an @mcl.edu.ph account.',
          'By registering and using the application, you agree to follow the platform rules and the MMCL Student Handbook.',
        ],
      },
      {
        heading: 'Your responsibilities',
        body: [
          'Provide accurate registration information, keep your account secure, and use the platform responsibly. Listings must contain honest descriptions, accurate prices, and clear transaction terms.',
          'Communicate respectfully and resolve transaction concerns fairly. CampuSmart may remove prohibited listings, investigate reports, and suspend or terminate accounts that repeatedly or seriously violate its policies.',
        ],
      },
      {
        heading: 'Our role',
        body: [
          'CampuSmart connects buyers and sellers. Unless additional services are introduced, the platform does not own, inspect, or guarantee the condition of listed items.',
          'Users are responsible for checking product details and for agreeing on payment, meet-up, and rental arrangements before completing a transaction.',
        ],
      },
      {
        heading: 'Changes to these terms',
        body: [
          'The platform terms may be updated when necessary, with reasonable notice to users. All users must comply with applicable Philippine laws and campus regulations when using the application.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'RA 10173 · Data Privacy Act of 2012',
    updated: 'November 2026',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'We collect only the information needed to confirm that a user is a student or staff member and to keep the marketplace safe: your name, verified institutional email address, school department, listings, messages, and transaction records.',
          'Student ID numbers, home addresses, phone numbers, and passwords are never displayed on your public profile.',
        ],
      },
      {
        heading: 'How we protect it',
        body: [
          'Data in transit is protected with TLS 1.3 and stored data is protected with AES-256 encryption. Verification documents are deleted or anonymised once review is complete.',
          'Access is limited by role. If a security incident occurs, the team will contain the problem, notify affected users and the National Privacy Commission within 72 hours, and prevent further exposure.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You may request access to or correction of your personal information, subject to applicable legal requirements. A Data Protection Officer reviews how data is used and handles privacy concerns.',
        ],
      },
    ],
  },
  seller: {
    title: 'Seller Policies & Prohibited Items',
    eyebrow: 'Selling on campus',
    updated: 'November 2026',
    sections: [
      {
        heading: 'Listing standards',
        body: [
          'Sellers must provide accurate descriptions, clear photos, reasonable prices, and disclose any damage or defects. For rentals, state the rental period, payment terms, deposit, and return conditions before the agreement is finalised.',
          'Basic listings are free. CampuSmart collects a 5% commission from completed transactions, based on the agreed price.',
        ],
      },
      {
        heading: 'Prohibited items',
        body: [
          'The platform prohibits illegal goods, stolen property, counterfeit products, dangerous items, prohibited substances, and items restricted by Philippine law or campus regulations.',
          'Also prohibited: fraud, leaked exam papers or test banks, unauthorised copyrighted materials, and misleading advertisements. Violations may result in listing removal, warnings, suspension, or permanent termination.',
        ],
      },
      {
        heading: 'Boosted posts',
        body: [
          'Post boosting is optional and costs ₱50 per day. Packages: 1 day ₱50, 3 days ₱150, 5 days ₱250, 7 days ₱350. Boosting increases visibility but does not guarantee a permanent top position or a completed sale.',
        ],
      },
    ],
  },
  refunds: {
    title: 'Cancellations & Refunds',
    eyebrow: 'Fair resolution',
    updated: 'November 2026',
    sections: [
      {
        heading: 'Cancelling an order',
        body: [
          'Buyers may cancel while an order is pending or confirmed, before the meet-up. Sellers may decline a pending order with a reason. Cancelled orders do not earn a commission.',
          'If a transaction is cancelled under eligible conditions — for example, when there is no buyer for an offer — the 5% commission is not charged.',
        ],
      },
      {
        heading: 'Promotional payments',
        body: [
          'Eligible promotional payments may be refunded when a boosted listing is removed by the platform through no fault of the seller, or when a boost cannot run for the purchased period.',
          'Boost payments are not refunded simply because a listing did not sell. Boosting does not guarantee sales.',
        ],
      },
      {
        heading: 'Disputes',
        body: [
          'Report a transaction problem through the app. Administrators review messages, receipts, and listing details, and may suspend ratings or accounts while a case is under review. Users may need to coordinate with their payment provider or the proper authorities if the platform cannot directly enforce a refund.',
        ],
      },
    ],
  },
  meetups: {
    title: 'Safe Campus Meetup Spots',
    eyebrow: 'Meet smart, meet safe',
    updated: 'November 2026',
    sections: [
      {
        heading: 'Designated zones',
        body: [
          'CampuSmart works with campus security to identify monitored meetup spots: the ET Yuchengco Building ground-floor lobby, the Library entrance, and the Student Lounge. These areas are well-lit, visible, and covered by security cameras.',
        ],
      },
      {
        heading: 'Before you meet',
        body: [
          'Agree on the item, price, payment method, and meetup time in the app. Keep your chat history and proof of payment. Inspect the item before paying and never share your password or one-time PINs.',
          'Report suspicious accounts or behaviour. Violations such as selling school property or abusive language may be referred to the Student Disciplinary Board.',
        ],
      },
      {
        heading: 'No delivery service',
        body: [
          'CampuSmart does not offer delivery or courier services. Buyers and sellers arrange the exchange themselves at an agreed safe campus location. No shipping fees, no hidden charges — all prices are shown in Philippine Pesos.',
        ],
      },
    ],
  },
};
