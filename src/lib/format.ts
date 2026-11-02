export const peso = (value: number, opts?: { decimals?: boolean }) => {
  const rounded = Math.round(value * 100) / 100;
  const hasCents = Math.round(rounded * 100) % 100 !== 0;
  return `₱${rounded.toLocaleString('en-PH', {
    minimumFractionDigits: opts?.decimals || hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

export const shortDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const dayMonth = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  });
};

export const timeOfDay = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const dateTime = (iso?: string) => {
  if (!iso) return '—';
  return `${dayMonth(iso)} · ${timeOfDay(iso)}`;
};

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return shortDate(iso);
};

export const chatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return timeOfDay(iso);
  return dayMonth(iso);
};

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const dayCount = (start: string, end: string) => {
  if (!start || !end) return 1;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)) + 1);
};

export const typeLabel: Record<string, string> = {
  sell: 'For sale',
  rent: 'For rent',
  borrow: 'For borrowing',
};

export const categoryImageChoices: Record<string, string[]> = {
  books: ['/img/books-stack.jpg', '/img/books-open.jpg', '/img/books-shelf.jpg', '/img/study.jpg', '/img/calculus.jpg'],
  supplies: [
    '/img/calculator.jpg',
    '/img/notebook.jpg',
    '/img/pens.jpg',
    '/img/art.jpg',
    '/img/lab2.jpg',
    '/img/lab3.jpg',
  ],
  uniforms: ['/img/hoodie.jpg', '/img/polo2.jpg', '/img/shirt.jpg', '/img/jacket.jpg'],
  food: ['/img/coffee.jpg', '/img/snacks.jpg', '/img/food.jpg', '/img/lunchbox.jpg'],
  accessories: [
    '/img/headphones.jpg',
    '/img/backpack.jpg',
    '/img/watch.jpg',
    '/img/glasses.jpg',
    '/img/tablet.jpg',
    '/img/camera.jpg',
    '/img/sneakers.jpg',
  ],
  other: ['/img/desk-lamp.jpg', '/img/waterbottle.jpg', '/img/cable.jpg', '/img/university.jpg'],
};
