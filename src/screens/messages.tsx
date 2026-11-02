import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Flag,
  MapPin,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../store';
import { chatTime, timeAgo } from '../lib/format';
import {
  Avatar,
  EmptyState,
  PageHeader,
  VerifiedMark,
} from '../components/ui';
import { ReportSheet } from '../components/ReportSheet';

export function MessagesScreen() {
  const navigate = useNavigate();
  const { state, currentUser } = useApp();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | 'buying' | 'selling'>('all');

  const threads = useMemo(() => {
    if (!currentUser) return [];
    return state.conversations
      .filter((c) => c.buyerId === currentUser.id || c.sellerId === currentUser.id)
      .map((c) => {
        const otherId = c.buyerId === currentUser.id ? c.sellerId : c.buyerId;
        const other = state.users.find((u) => u.id === otherId);
        const listing = state.listings.find((l) => l.id === c.listingId);
        const unread = c.messages.filter(
          (m) => m.senderId !== currentUser.id && !m.read,
        ).length;
        const last = c.messages[c.messages.length - 1];
        const role = c.buyerId === currentUser.id ? 'buying' : 'selling';
        return { convo: c, other, listing, unread, last, role };
      })
      .filter((t) => t.other)
      .filter((t) => (tab === 'all' ? true : t.role === tab))
      .filter((t) => {
        if (!q.trim()) return true;
        const term = q.toLowerCase();
        return (
          t.other?.name.toLowerCase().includes(term) ||
          t.listing?.title.toLowerCase().includes(term) ||
          t.last?.text.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => +new Date(b.convo.updatedAt) - +new Date(a.convo.updatedAt));
  }, [state.conversations, state.users, state.listings, currentUser, tab, q]);

  const totalUnread = threads.reduce((sum, t) => sum + t.unread, 0);

  return (
    <div className="screen">
      <div className="row between" style={{ padding: '18px 20px 10px' }}>
        <div>
          <span className="eyebrow">Keep it in-app</span>
          <h1 className="h2" style={{ marginTop: 1 }}>
            Messages
          </h1>
        </div>
        {totalUnread > 0 && (
          <span className="badge navy">{totalUnread} unread</span>
        )}
      </div>

      <div className="page tight" style={{ paddingTop: 0 }}>
        <div className="search-bar inline" style={{ marginBottom: 12 }}>
          <Search size={17} />
          <input
            placeholder="Search messages or sellers"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search messages"
          />
        </div>

        <div className="segmented" style={{ marginBottom: 4 }}>
          <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>
            All
          </button>
          <button className={tab === 'buying' ? 'active' : ''} onClick={() => setTab('buying')}>
            Buying
          </button>
          <button className={tab === 'selling' ? 'active' : ''} onClick={() => setTab('selling')}>
            Selling
          </button>
        </div>

        {threads.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={30} />}
            title="No conversations yet"
            body="Ask a seller about an item, clarify a meetup, or arrange a rental. Chats stay inside CampuSmart."
            action="Browse listings"
            onAction={() => navigate('/explore')}
          />
        ) : (
          <div className="card pad" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {threads.map(({ convo, other, listing, unread, last }) => (
              <button
                key={convo.id}
                className="thread"
                onClick={() => navigate(`/chat/${convo.id}`)}
              >
                <Avatar user={other!} online />
                <div className="body">
                  <div className="top">
                    <span className="name row" style={{ gap: 4 }}>
                      {other!.name}
                      {other!.verified && <VerifiedMark />}
                    </span>
                    <span className="time">{last ? timeAgo(last.at) : ''}</span>
                  </div>
                  <div className={`preview ${unread ? 'unread' : ''}`}>
                    {last
                      ? `${last.senderId === currentUser?.id ? 'You: ' : ''}${last.text}`
                      : 'Start the conversation'}
                  </div>
                  {listing && (
                    <span className="listing-ref">
                      <ShoppingBag size={9} /> {listing.title}
                    </span>
                  )}
                </div>
                {unread > 0 && <span className="unread-pill">{unread}</span>}
              </button>
            ))}
          </div>
        )}

        <div className="safe-strip" style={{ margin: '16px 0 0' }}>
          <span className="icon">
            <ShieldCheck size={17} />
          </span>
          <div>
            <p>
              <strong>Trade safely</strong>
              Keep conversations and payment proof in the app. Meet only at designated spots and
              never share one-time PINs or passwords.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ chat */

export function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    state,
    currentUser,
    sendMessage,
    markConversationRead,
  } = useApp();
  const [text, setText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const convo = state.conversations.find((c) => c.id === id);
  const other = convo
    ? state.users.find((u) =>
        u.id === (convo.buyerId === currentUser?.id ? convo.sellerId : convo.buyerId),
      )
    : undefined;
  const listing = convo ? state.listings.find((l) => l.id === convo.listingId) : undefined;
  const messages = convo?.messages ?? [];
  const relevantOrder = convo
    ? state.orders.find(
        (o) =>
          o.buyerId === convo.buyerId &&
          o.sellerId === convo.sellerId &&
          o.lines.some((l) => l.listingId === convo.listingId),
      )
    : undefined;

  useEffect(() => {
    if (convo && currentUser) {
      markConversationRead(convo.id);
    }
  }, [convo?.id, currentUser?.id, messages.length]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages.length]);

  if (!convo || !currentUser || !other) {
    return (
      <div className="chat-screen">
        <PageHeader title="Chat" backTo="/messages" />
        <EmptyState
          icon={<MessageCircle size={30} />}
          title="Conversation not found"
          body="This conversation may have been removed."
          action="Back to messages"
          onAction={() => navigate('/messages')}
        />
      </div>
    );
  }

  const send = (value?: string) => {
    const message = (value ?? text).trim();
    if (!message) return;
    sendMessage(convo.id, message);
    setText('');
  };

  const quickReplies = listing
    ? [
        'Hi! Is this still available?',
        'Can we meet at the library?',
        'Is the price negotiable?',
        'Can I inspect it first?',
      ]
    : ['Hi!', 'Are you available today?', 'Thank you!'];

  return (
    <div className="chat-screen">
      <div className="chat-head">
        <button className="icon-btn" onClick={() => navigate('/messages')} aria-label="Back">
          <ArrowRight size={19} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button
          className="row grow"
          style={{ textAlign: 'left', gap: 9 }}
          onClick={() => navigate(`/seller/${other.id}`)}
        >
          <Avatar user={other} />
          <div>
            <div className="name">
              {other.name}
              {other.verified && <VerifiedMark />}
            </div>
            <div className="status">Verified campus member</div>
          </div>
        </button>
        <button
          className="icon-btn"
          onClick={() => setReportOpen(true)}
          aria-label="Report user"
        >
          <Flag size={17} />
        </button>
      </div>

      {listing && (
        <button
          className="chat-context"
          onClick={() => navigate(`/product/${listing.id}`)}
        >
          <img src={listing.image} alt="" />
          <span className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
            <span className="t" style={{ display: 'block' }}>
              {listing.title}
            </span>
            <span className="p">
              {listing.type === 'rent'
                ? `₱${listing.rentalPerDay}/day`
                : listing.type === 'borrow'
                  ? 'Free to borrow'
                  : `₱${listing.price}`}
            </span>
          </span>
          <ArrowRight size={14} style={{ color: 'var(--muted-2)' }} />
        </button>
      )}

      {relevantOrder && (
        <button
          className="row"
          style={{
            margin: '8px 14px 0',
            padding: '8px 11px',
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            fontSize: 10.5,
            fontWeight: 700,
            gap: 6,
            color: 'var(--navy-600)',
          }}
          onClick={() => navigate(`/order/${relevantOrder.id}`)}
        >
          <ShoppingBag size={12} /> View order #{relevantOrder.id.slice(-7).toUpperCase()}
          <ArrowRight size={12} style={{ marginLeft: 'auto' }} />
        </button>
      )}

      <div className="chat-body" ref={bodyRef}>
        <div className="center" style={{ margin: '2px 0 6px' }}>
          <span className="badge outline" style={{ height: 22, fontSize: 9 }}>
            <ShieldCheck size={10} /> Messages are private to verified members
          </span>
        </div>
        {messages.length === 0 && (
          <div className="inset" style={{ margin: '8px 0' }}>
            <p className="tiny muted" style={{ lineHeight: 1.55 }}>
              Start the conversation. Ask about the item's condition, availability, or meetup time.
              Use the quick replies below or type your own message.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.senderId === currentUser.id ? 'me' : 'them'}`}>
            {m.text}
            <span className="time">{chatTime(m.at)}</span>
          </div>
        ))}
        {listing && (
          <div className="center" style={{ marginTop: 4 }}>
            <span className="tiny muted row" style={{ justifyContent: 'center', gap: 4 }}>
              <MapPin size={10} /> Meet only at designated safe spots
            </span>
          </div>
        )}
      </div>

      <div className="quick-replies">
        {quickReplies.map((r) => (
          <button key={r} onClick={() => send(r)}>
            {r}
          </button>
        ))}
      </div>

      <div className="chat-compose">
        <input
          className="input"
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          aria-label="Message"
        />
        <button className="send" onClick={() => send()} aria-label="Send message" disabled={!text.trim()}>
          <Send size={18} />
        </button>
      </div>

      <ReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetUserId={other.id}
        targetName={other.name}
      />
    </div>
  );
}
