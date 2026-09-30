// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Community, Merchandise & Messaging Shared Data Store
// File: src/lib/community-data.ts
// =====================================================================

import type {
  Profile,
  Message,
  NewsEvent,
  Product,
  MessageWithProfiles,
  NewsEventType,
  UserRole,
} from '@/types/database';
import {
  mockProfiles as initialProfiles,
  mockMessages as initialMessages,
} from './mock-data';

export const COMMUNITY_STORAGE_KEY = 'fsl_community_store_v1';
export const COMMUNITY_STORE_EVENT = 'fsl-community-store-updated';

// ---------------------------------------------------------------------
// Domain Interfaces
// ---------------------------------------------------------------------

export interface NewsEventWithDetails extends NewsEvent {
  accommodations?: string;
  organizer?: string;
  category_label?: string;
}

export interface ProductWithDetails extends Product {
  badge?: string;
  icon_emoji?: string;
}

export interface MerchandiseInquiry {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  recipient_name: string;
  email: string;
  contact_number?: string;
  delivery_address?: string;
  notes?: string;
  status: 'submitted' | 'processing' | 'confirmed';
  created_at: string;
}

export interface ConversationSummary {
  partner: Profile;
  lastMessage: Message;
  unreadCount: number;
}

// ---------------------------------------------------------------------
// Grounded Initial Datasets
// ---------------------------------------------------------------------

export const INITIAL_NEWS_EVENTS: NewsEventWithDetails[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Benilde Deaf Festival Highlights & Performance Schedules',
    body: 'Join us for the premier Deaf cultural celebration in the Philippines featuring Deaf visual artists, signing choir performances, visual theatre, and community panel discussions.',
    type: 'deaf_festival',
    category_label: 'Deaf Festival',
    date: '2026-10-15',
    image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    location: 'DLS-CSB SDEAS Campus, Taft Avenue, Manila',
    organizer: 'Benilde SDEAS Cultural Affairs & Deaf Heritage Committee',
    accommodations: 'Professional FSL interpreters on-stage for all performances, live speech-to-text / CART captioning, and visual stage cues.',
    created_at: '2026-09-10T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'SDEAS Deaf Awareness Week Celebration: 30+ Years of Inclusive Education',
    body: 'De La Salle-College of Saint Benilde School of Deaf Education and Applied Studies (SDEAS) marks over 30 years of pioneering Deaf higher education and FSL advocacy in the Philippines.',
    type: 'sdeas_news',
    category_label: 'SDEAS News',
    date: '2026-09-20',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    location: 'School of Deaf Education and Applied Studies (SDEAS), Manila',
    organizer: 'SDEAS Office of the Dean & Academic Council',
    accommodations: 'Fully accessible visual environment, simultaneous FSL interpreting, tactile signing guides, and Deaf guide concierges.',
    created_at: '2026-09-15T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Republic Act 11106 (The Filipino Sign Language Act) Forums & Advocacy Sessions',
    body: 'National consultative symposium discussing compliance standards, court interpretation protocols, deaf literacy, and broadcast media compliance under the Filipino Sign Language Act.',
    type: 'seminar',
    category_label: 'Events & Seminars',
    date: '2026-11-05',
    image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80',
    location: 'Benilde Augusto-Rosario Gonzalez Theater & Hybrid Online',
    organizer: 'Philippine National Council on Disability Affairs (NCDA) & SDEAS',
    accommodations: 'Court-certified FSL interpreters, Zoom live closed captioning, and Deaf-blind tactile interpretation assistance upon advance registration.',
    created_at: '2026-09-18T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Deaf Community Career & Immersion Programs 2026',
    body: 'Connecting Deaf graduates and FSL learners with inclusive corporate employers, partner NGOs, and educational institutions nationwide for internships and professional placements.',
    type: 'event',
    category_label: 'Events & Seminars',
    date: '2026-10-28',
    image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    location: 'Benilde Atrium & Exhibition Hall, Manila',
    organizer: 'SDEAS Career Placement Center & Partner Deaf Organizations',
    accommodations: 'FSL-fluent job interview proctors, visual assistive kiosks, and live signing concierges.',
    created_at: '2026-09-22T08:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    title: 'Bachelor in Sign Language Interpretation (BSLI) AY 2027 Admissions Briefing',
    body: 'Comprehensive information session for Level 3 workshop completers and prospective interpreting candidates covering curriculum, practicum hours, and scholarship opportunities.',
    type: 'sdeas_news',
    category_label: 'SDEAS News',
    date: '2026-11-12',
    image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    location: 'Online via Zoom & SDEAS Audio-Visual Conference Room',
    organizer: 'Benilde SDEAS Academic Programs & Admissions Office',
    accommodations: 'Bidirectional spoken Filipino / English and Filipino Sign Language interpretation.',
    created_at: '2026-09-25T08:00:00Z',
  },
];

export const INITIAL_PRODUCTS: ProductWithDetails[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'FSL "I Love You" Sign Graphic T-Shirt',
    price: 450,
    stock: 45,
    category: 'Apparel',
    description: 'Premium navy combed cotton shirt featuring the iconic FSL I Love You handshape graphic. High-contrast typography designed by Deaf artists.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    badge: 'Popular',
    icon_emoji: '👕',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Deaf Pride Canvas Tote Bag',
    price: 350,
    stock: 60,
    category: 'Accessories',
    description: 'Durable 14oz eco-friendly canvas tote bag with reinforced dual-stitch handles, showcasing Deaf Pride visual typography and signing illustration.',
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    badge: 'Eco-Friendly',
    icon_emoji: '👜',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'FSL Fingerspelling Enamel Pin Set',
    price: 250,
    stock: 120,
    category: 'Pins & Badges',
    description: 'Collector-grade hard enamel lapel pin set depicting key FSL fingerspelling manual handshapes with gold electroplating and secure butterfly clasp.',
    image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&auto=format&fit=crop&q=80',
    badge: 'Collectible',
    icon_emoji: '🏷️',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'FSL Alphabet Lanyard & Badge Holder',
    price: 180,
    stock: 85,
    category: 'Accessories',
    description: 'High-density woven neck lanyard printed with the complete A-Z FSL alphabet chart, safety breakaway clasp, and clear waterproof ID badge holder.',
    image_url: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600&auto=format&fit=crop&q=80',
    badge: 'Essential',
    icon_emoji: '🎗️',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Benilde SDEAS Deaf Festival Commemorative Hoodie',
    price: 950,
    stock: 25,
    category: 'Apparel',
    description: 'Heavyweight brushed cotton-poly fleece hoodie commemorating the Benilde Deaf Festival with embroidered FSL chest motif and kangaroo pocket.',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
    badge: 'Limited Edition',
    icon_emoji: '🧥',
    created_at: '2026-09-01T08:00:00Z',
  },
];

export const INITIAL_MESSAGES: Message[] = [
  ...initialMessages,
  {
    id: '20000000-0000-0000-0000-000000000004',
    sender_id: 'a0000000-0000-0000-0000-000000000001',
    receiver_id: 'c0000000-0000-0000-0000-000000000001',
    body: 'Welcome to FSL Workshop System Juan! If you have any inquiries regarding your enrollment or fee verification, the Admin office is here to help.',
    read: true,
    created_at: '2026-09-20T09:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    sender_id: 'c0000000-0000-0000-0000-000000000001',
    receiver_id: 'a0000000-0000-0000-0000-000000000001',
    body: 'Thank you Director Maria! My payment receipt was verified smoothly yesterday. Looking forward to our Saturday class!',
    read: true,
    created_at: '2026-09-20T09:15:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000006',
    sender_id: 'b0000000-0000-0000-0000-000000000001',
    receiver_id: 'a0000000-0000-0000-0000-000000000001',
    body: 'Hello Director Maria, both Batch A and Batch B Level 1 schedules have filled their slots. Attendance records are updated.',
    read: false,
    created_at: '2026-09-28T11:00:00Z',
  },
];

// ---------------------------------------------------------------------
// In-Memory State
// ---------------------------------------------------------------------

let profilesState: Profile[] = JSON.parse(JSON.stringify(initialProfiles));
let messagesState: Message[] = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
let newsState: NewsEventWithDetails[] = JSON.parse(JSON.stringify(INITIAL_NEWS_EVENTS));
let productsState: ProductWithDetails[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let inquiriesState: MerchandiseInquiry[] = [];

let isHydrated = false;

function hydrateFromLocalStorage() {
  if (typeof window === 'undefined') return;
  if (isHydrated) return;

  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.profiles && Array.isArray(parsed.profiles)) profilesState = parsed.profiles;
      if (parsed.messages && Array.isArray(parsed.messages)) messagesState = parsed.messages;
      if (parsed.news && Array.isArray(parsed.news)) newsState = parsed.news;
      if (parsed.products && Array.isArray(parsed.products)) productsState = parsed.products;
      if (parsed.inquiries && Array.isArray(parsed.inquiries)) inquiriesState = parsed.inquiries;
    }
  } catch (err) {
    console.error('Failed to hydrate community store from localStorage:', err);
  } finally {
    isHydrated = true;
  }
}

function persistToLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      profiles: profilesState,
      messages: messagesState,
      news: newsState,
      products: productsState,
      inquiries: inquiriesState,
    };
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(COMMUNITY_STORE_EVENT));
  } catch (err) {
    console.error('Failed to persist community store to localStorage:', err);
  }
}

/**
 * Resets the in-memory store and localStorage back to initial demo seeds.
 */
export function resetCommunityStore() {
  profilesState = JSON.parse(JSON.stringify(initialProfiles));
  messagesState = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
  newsState = JSON.parse(JSON.stringify(INITIAL_NEWS_EVENTS));
  productsState = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  inquiriesState = [];
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(COMMUNITY_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(COMMUNITY_STORE_EVENT));
    } catch {}
  }
}

/**
 * Subscribes to store changes across components and storage events.
 */
export function subscribeToCommunityStore(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  hydrateFromLocalStorage();
  const handler = () => callback();
  window.addEventListener(COMMUNITY_STORE_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === COMMUNITY_STORAGE_KEY) {
      isHydrated = false;
      hydrateFromLocalStorage();
      callback();
    }
  });

  return () => {
    window.removeEventListener(COMMUNITY_STORE_EVENT, handler);
  };
}

// ---------------------------------------------------------------------
// Profile Helpers
// ---------------------------------------------------------------------

export function getCommunityProfiles(): Profile[] {
  hydrateFromLocalStorage();
  return [...profilesState];
}

export function getCommunityProfileById(id: string): Profile | undefined {
  hydrateFromLocalStorage();
  // Support either full UUID or shorthand identifier matching
  return profilesState.find((p) => p.id === id || p.id.includes(id));
}

// ---------------------------------------------------------------------
// Messaging System Business Logic (Feature 15)
// ---------------------------------------------------------------------

export function getAllMessages(): Message[] {
  hydrateFromLocalStorage();
  return [...messagesState];
}

/**
 * Retrieves all messages between two users in chronological order with sender/receiver details.
 */
export function getMessageThread(user1Id: string, user2Id: string): MessageWithProfiles[] {
  hydrateFromLocalStorage();

  const isUser1Match = (id: string) => id === user1Id || id.includes(user1Id);
  const isUser2Match = (id: string) => id === user2Id || id.includes(user2Id);

  const thread = messagesState.filter(
    (m) =>
      (isUser1Match(m.sender_id) && isUser2Match(m.receiver_id)) ||
      (isUser2Match(m.sender_id) && isUser1Match(m.receiver_id))
  );

  thread.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return thread.map((m) => ({
    ...m,
    sender: getCommunityProfileById(m.sender_id),
    receiver: getCommunityProfileById(m.receiver_id),
  }));
}

/**
 * Returns a list of conversation partners for a given user, including last message preview and unread count.
 */
export function getConversations(userId: string): ConversationSummary[] {
  hydrateFromLocalStorage();

  const isCurrentUser = (id: string) => id === userId || id.includes(userId);

  // Find all messages involving this user
  const userMessages = messagesState.filter(
    (m) => isCurrentUser(m.sender_id) || isCurrentUser(m.receiver_id)
  );

  // Collect unique partner IDs
  const partnerIdMap = new Map<string, { lastMessage: Message; unreadCount: number }>();

  // Sort messages descending to easily find latest message per partner
  const sorted = [...userMessages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const m of sorted) {
    const partnerId = isCurrentUser(m.sender_id) ? m.receiver_id : m.sender_id;
    if (!partnerIdMap.has(partnerId)) {
      partnerIdMap.set(partnerId, {
        lastMessage: m,
        unreadCount: 0,
      });
    }

    if (isCurrentUser(m.receiver_id) && !m.read) {
      const entry = partnerIdMap.get(partnerId)!;
      entry.unreadCount += 1;
    }
  }

  // Also include available profiles (learners, professors, admin) if no message yet,
  // so users can initiate a new conversation.
  for (const profile of profilesState) {
    if (!isCurrentUser(profile.id) && !partnerIdMap.has(profile.id)) {
      partnerIdMap.set(profile.id, {
        lastMessage: {
          id: `empty-${profile.id}`,
          sender_id: profile.id,
          receiver_id: userId,
          body: `No messages yet with ${profile.name}`,
          read: true,
          created_at: profile.created_at,
        },
        unreadCount: 0,
      });
    }
  }

  const summaries: ConversationSummary[] = [];

  partnerIdMap.forEach((data, partnerId) => {
    const partner = getCommunityProfileById(partnerId);
    if (partner) {
      summaries.push({
        partner,
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount,
      });
    }
  });

  // Sort: active conversations with recent messages first
  summaries.sort((a, b) => {
    const aTime = new Date(a.lastMessage.created_at).getTime();
    const bTime = new Date(b.lastMessage.created_at).getTime();
    return bTime - aTime;
  });

  return summaries;
}

/**
 * Sends a direct message between sender and receiver.
 */
export function sendMessage(senderId: string, receiverId: string, body: string): Message {
  hydrateFromLocalStorage();

  if (!senderId || !receiverId) {
    throw new Error('Sender and receiver IDs are required');
  }

  if (senderId === receiverId) {
    throw new Error('Cannot send message to yourself');
  }

  const trimmedBody = (body || '').trim();
  if (trimmedBody.length === 0) {
    throw new Error('Message body cannot be empty');
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    sender_id: senderId,
    receiver_id: receiverId,
    body: trimmedBody,
    read: false,
    created_at: new Date().toISOString(),
  };

  messagesState.push(newMessage);
  persistToLocalStorage();

  return newMessage;
}

/**
 * Marks all incoming messages from partnerId to currentUserId as read.
 */
export function markThreadAsRead(currentUserId: string, partnerId: string): void {
  hydrateFromLocalStorage();

  const isCurrentUser = (id: string) => id === currentUserId || id.includes(currentUserId);
  const isPartner = (id: string) => id === partnerId || id.includes(partnerId);

  let updated = false;

  for (const m of messagesState) {
    if (isCurrentUser(m.receiver_id) && isPartner(m.sender_id) && !m.read) {
      m.read = true;
      updated = true;
    }
  }

  if (updated) {
    persistToLocalStorage();
  }
}

// ---------------------------------------------------------------------
// News & Events Business Logic (Feature 16)
// ---------------------------------------------------------------------

export type NewsFilterCategory = 'all' | 'sdeas_news' | 'deaf_festival' | 'event' | 'seminar';

export function getNewsEvents(filterType?: string): NewsEventWithDetails[] {
  hydrateFromLocalStorage();

  if (!filterType || filterType === 'all') {
    return [...newsState].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  const normalized = filterType.toLowerCase().trim();

  // Support flexible filter tab keys like 'events_seminars' or exact types
  if (normalized === 'events_seminars' || normalized === 'events & seminars') {
    return newsState
      .filter((n) => n.type === 'event' || n.type === 'seminar')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return newsState
    .filter((n) => n.type === normalized)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getNewsEventById(id: string): NewsEventWithDetails | undefined {
  hydrateFromLocalStorage();
  return newsState.find((n) => n.id === id);
}

// ---------------------------------------------------------------------
// Merchandise Catalog Business Logic (Feature 17)
// ---------------------------------------------------------------------

export type MerchandiseCategoryFilter = 'all' | 'Apparel' | 'Accessories' | 'Pins & Badges';

export function getProducts(categoryFilter?: string): ProductWithDetails[] {
  hydrateFromLocalStorage();

  if (!categoryFilter || categoryFilter.toLowerCase() === 'all') {
    return [...productsState];
  }

  const normalized = categoryFilter.toLowerCase().trim();

  return productsState.filter(
    (p) => p.category && p.category.toLowerCase().trim() === normalized
  );
}

export function getProductById(id: string): ProductWithDetails | undefined {
  hydrateFromLocalStorage();
  return productsState.find((p) => p.id === id);
}

export interface InquirySubmissionPayload {
  quantity: number;
  recipientName: string;
  email: string;
  contactNumber?: string;
  deliveryAddress?: string;
  notes?: string;
}

/**
 * Submits a simulated merchandise inquiry/order and atomically decrements product stock.
 */
export function submitMerchandiseInquiry(
  productId: string,
  payload: InquirySubmissionPayload
): {
  success: boolean;
  orderId: string;
  message: string;
  updatedProduct: ProductWithDetails;
  inquiry: MerchandiseInquiry;
} {
  hydrateFromLocalStorage();

  const product = productsState.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Product with ID "${productId}" not found in catalog.`);
  }

  const qty = Number(payload.quantity);
  if (isNaN(qty) || qty <= 0) {
    throw new Error('Order quantity must be at least 1 unit.');
  }

  if (product.stock < qty) {
    throw new Error(
      `Insufficient stock for "${product.name}". Requested: ${qty}, Available: ${product.stock}.`
    );
  }

  if (!payload.recipientName || payload.recipientName.trim().length === 0) {
    throw new Error('Recipient name is required for merchandise inquiry.');
  }

  if (!payload.email || !payload.email.includes('@')) {
    throw new Error('A valid contact email is required.');
  }

  // Atomically decrement stock
  product.stock -= qty;

  const orderId = `ORD-FSL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  const inquiry: MerchandiseInquiry = {
    id: orderId,
    product_id: product.id,
    product_name: product.name,
    quantity: qty,
    unit_price: product.price,
    total_price: product.price * qty,
    recipient_name: payload.recipientName.trim(),
    email: payload.email.trim(),
    contact_number: payload.contactNumber?.trim(),
    delivery_address: payload.deliveryAddress?.trim(),
    notes: payload.notes?.trim(),
    status: 'submitted',
    created_at: new Date().toISOString(),
  };

  inquiriesState.push(inquiry);
  persistToLocalStorage();

  return {
    success: true,
    orderId,
    message: `Pre-order inquiry #${orderId} for ${qty}x ${product.name} recorded successfully!`,
    updatedProduct: { ...product },
    inquiry,
  };
}

export function getMerchandiseInquiries(): MerchandiseInquiry[] {
  hydrateFromLocalStorage();
  return [...inquiriesState];
}
