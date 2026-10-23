/** Local inbox. There is no customer notifications API yet, so the screen
 *  shows the designed feed and remembers what the customer has read. */

export const filters = [
  { id: 'all', label: 'All', icon: 'bell' },
  { id: 'orders', label: 'Orders', icon: 'package' },
  { id: 'offers', label: 'Offers', icon: 'tag' },
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'system', label: 'System', icon: 'gear' },
];

export const groups = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'earlier', label: 'Earlier' },
];

export const notifications = [
  {
    id: 'confirmed',
    group: 'today',
    category: 'orders',
    icon: 'package',
    title: 'Order Confirmed',
    body: 'Your order #PO783256 has been confirmed\nand is being processed.',
    time: '2 hours ago',
    href: '/orders',
    unread: true,
  },
  {
    id: 'offer',
    group: 'today',
    category: 'offers',
    icon: 'tag',
    title: 'Special Offer for You!',
    body: 'Get ৳200 off on all electronics products.\nUse code: ELECTRO200',
    highlight: 'ELECTRO200',
    time: '5 hours ago',
    href: '/products',
    thumb: 'save',
    unread: true,
  },
  {
    id: 'delivery',
    group: 'today',
    category: 'orders',
    icon: 'truck',
    title: 'Out for Delivery',
    body: 'Your order #PO783256 is out for delivery\nand will arrive today.',
    time: '8 hours ago',
    href: '/orders',
    unread: true,
  },
  {
    id: 'price',
    group: 'yesterday',
    category: 'offers',
    icon: 'heart',
    title: 'Price Drop Alert',
    body: 'A product in your wishlist is now at a lower price.',
    time: 'Yesterday, 4:30 PM',
    href: '/wishlist',
    thumb: 'price',
    unread: true,
  },
  {
    id: 'arrivals',
    group: 'yesterday',
    category: 'offers',
    icon: 'star',
    title: 'New Arrivals',
    body: 'Check out the latest neckbands and accessories\nin Electronics.',
    time: 'Yesterday, 11:15 AM',
    href: '/products',
    thumb: 'arrivals',
  },
  {
    id: 'payment',
    group: 'week',
    category: 'orders',
    icon: 'clipboard',
    title: 'Payment Successful',
    body: 'Your payment of ৳1,080 for order #PO783256\nwas successful.',
    time: '20 Oct 2026, 10:20 PM',
    href: '/orders',
  },
  {
    id: 'welcome',
    group: 'earlier',
    category: 'account',
    icon: 'megaphone',
    title: 'Welcome to PickOrbeet!',
    body: 'Thanks for joining us. Get the best deals on\nelectronics, fashion and more.',
    time: '18 Oct 2026, 09:00 AM',
    href: '/account',
  },
];

export const channels = [
  { id: 'orders', title: 'Order updates', detail: 'Confirmation, delivery and payment', icon: 'package' },
  { id: 'offers', title: 'Offers & price drops', detail: 'Deals, new arrivals and wishlist alerts', icon: 'tag' },
  { id: 'account', title: 'Account activity', detail: 'Welcome notes and account messages', icon: 'user' },
  { id: 'system', title: 'System alerts', detail: 'Security and app updates', icon: 'gear' },
];

export const defaultChannels = { orders: true, offers: true, account: true, system: true };

const READ_KEY = 'pickorbeet.notification.read';
const CHANNEL_KEY = 'pickorbeet.notification.channels';

const defaultRead = notifications.filter((item) => !item.unread).map((item) => item.id);

export function loadReadIds() {
  if (typeof window === 'undefined') return new Set(defaultRead);
  try {
    const saved = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
    return new Set([...defaultRead, ...saved]);
  } catch {
    return new Set(defaultRead);
  }
}

export function saveReadIds(ids) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export function loadChannels() {
  if (typeof window === 'undefined') return { ...defaultChannels };
  try {
    return { ...defaultChannels, ...JSON.parse(localStorage.getItem(CHANNEL_KEY) || '{}') };
  } catch {
    return { ...defaultChannels };
  }
}

export function saveChannels(value) {
  localStorage.setItem(CHANNEL_KEY, JSON.stringify(value));
}

export const iconTints = {
  package: { background: '#E7F0FF', color: '#3B82F6' },
  tag: { background: '#FFE8EA', color: '#FF4D67' },
  truck: { background: '#E5F8EC', color: '#1FBE5A' },
  heart: { background: '#F3E8FF', color: '#A855F7' },
  star: { background: '#FFF3DC', color: '#F5A018' },
  clipboard: { background: '#E7F0FF', color: '#3B82F6' },
  megaphone: { background: '#FFE6EC', color: '#FF5D7E' },
  bell: { background: '#E7F0FF', color: '#3B82F6' },
  user: { background: '#E7F0FF', color: '#3B82F6' },
  gear: { background: '#EEF1F6', color: '#5C6B8A' },
};

export function emptyCopy(filter) {
  if (filter === 'system') {
    return {
      title: 'No system notifications',
      body: 'Security alerts and app updates will land here.',
    };
  }
  if (filter === 'orders') {
    return {
      title: 'No order updates',
      body: 'Confirmation, delivery and payment messages will show up here.',
    };
  }
  if (filter === 'offers') {
    return {
      title: 'No offers right now',
      body: 'Deals, price drops and new arrivals will show up here.',
    };
  }
  if (filter === 'account') {
    return {
      title: 'No account messages',
      body: 'Notes about your PickOrbeet account will show up here.',
    };
  }
  return {
    title: 'You’re all caught up',
    body: 'New orders, offers and account updates will show up here.',
  };
}
