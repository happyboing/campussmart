import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ImagePlus,
  Info,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useApp } from '../store';
import { CATEGORIES, LISTING_TYPES, SAFE_SPOTS } from '../data/catalog';
import {
  categoryImageChoices,
  peso,
  typeLabel,
} from '../lib/format';
import type { CategoryId, ItemCondition, ListingType } from '../types';
import { PageHeader, useToast } from '../components/ui';

const CONDITIONS: ItemCondition[] = ['New', 'Like new', 'Good', 'Fair'];

export function SellScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const { state, currentUser, createListing, updateListing } = useApp();
  const { toast } = useToast();

  const editing = editId ? state.listings.find((l) => l.id === editId) : undefined;
  const isOwner = editing?.sellerId === currentUser?.id;

  const [step, setStep] = useState(1);
  const [type, setType] = useState<ListingType>(editing?.type ?? 'sell');
  const [category, setCategory] = useState<CategoryId>(editing?.category ?? 'books');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [price, setPrice] = useState(editing?.price ? String(editing.price) : '');
  const [rentalPerDay, setRentalPerDay] = useState(
    editing?.rentalPerDay ? String(editing.rentalPerDay) : '',
  );
  const [deposit, setDeposit] = useState(editing?.deposit ? String(editing.deposit) : '');
  const [condition, setCondition] = useState<ItemCondition>(editing?.condition ?? 'Good');
  const [terms, setTerms] = useState(editing?.terms ?? '');
  const [image, setImage] = useState(editing?.image ?? categoryImageChoices.books[0]);
  const [spots, setSpots] = useState<string[]>(
    editing?.meetupSpots?.length ? editing.meetupSpots : ['library'],
  );
  const [available, setAvailable] = useState(editing?.available ?? true);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const numericPrice = Number(price) || 0;
  const numericRent = Number(rentalPerDay) || 0;
  const numericDeposit = Number(deposit) || 0;
  const commission = Math.round((type === 'rent' ? numericRent : numericPrice) * 0.05 * 100) / 100;
  const payout =
    type === 'borrow'
      ? 0
      : Math.round(((type === 'rent' ? numericRent : numericPrice) - commission) * 100) / 100;

  const choices = useMemo(() => {
    const base = categoryImageChoices[category] ?? [];
    return editing && !base.includes(editing.image)
      ? [editing.image, ...base]
      : base;
  }, [category, editing]);

  if (!currentUser) return null;

  if (editing && !isOwner) {
    return (
      <div className="screen">
        <PageHeader title="Edit listing" backTo="/seller" />
        <p className="page small muted">You can only edit your own listings.</p>
      </div>
    );
  }

  const changeCategory = (id: CategoryId) => {
    setCategory(id);
    setImage(categoryImageChoices[id][0]);
  };

  const handleUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file.', 'error');
      return;
    }
    if (file.size > 1.2 * 1024 * 1024) {
      toast('Please choose an image under 1.2 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setImage(reader.result);
      toast('Photo added to your listing.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const next = () => {
    setError('');
    if (step === 1) {
      if (title.trim().length < 6) return setError('Give your listing a clear title (6+ characters).');
      if (description.trim().length < 20)
        return setError('Add a description of at least 20 characters, including any defects.');
      setStep(2);
      return;
    }
    if (step === 2) {
      if (type !== 'borrow' && numericPrice <= 0 && numericRent <= 0)
        return setError(type === 'rent' ? 'Set a daily rental rate.' : 'Set a price.');
      if (type === 'rent' && numericRent <= 0) return setError('Set a daily rental rate.');
      if (type === 'sell' && numericPrice <= 0) return setError('Set a price.');
      setStep(3);
    }
  };

  const publish = () => {
    setError('');
    if (!spots.length) return setError('Choose at least one safe meetup spot.');
    if (!image) return setError('Choose a listing photo.');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      price: type === 'rent' ? 0 : numericPrice,
      rentalPerDay: type === 'rent' ? numericRent : undefined,
      deposit: type === 'sell' ? 0 : numericDeposit,
      condition,
      image,
      meetupSpots: spots,
      terms: type === 'sell' ? undefined : terms.trim() || undefined,
    };

    if (editing) {
      updateListing(editing.id, { ...payload, available });
      toast('Listing updated.', 'success');
      navigate(`/product/${editing.id}`);
      return;
    }

    const id = createListing(payload);
    toast('Listing published. It is now visible to verified MMCL members.', 'success');
    navigate(`/product/${id}`);
  };

  return (
    <div className="screen">
      <div className="topbar">
        <div className="topbar-inner">
          <button
            className="icon-btn"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
            aria-label="Go back"
          >
            <ChevronLeft size={21} />
          </button>
          <div className="grow">
            <div className="title">{editing ? 'Edit listing' : 'Sell an item'}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: -1 }}>
              {editing ? 'Update your campus storefront' : 'Free basic listing · 5% on completed sales'}
            </div>
          </div>
          <span className="badge outline">Step {step}/3</span>
        </div>
      </div>

      <div className="sell-progress">
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= step ? 'on' : ''} />
        ))}
      </div>

      <div className="page tight" style={{ paddingTop: 0 }}>
        {error && (
          <div className="form-alert error">
            <Info size={15} style={{ marginTop: 1, flex: '0 0 auto' }} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <>
            <h2 className="h2">What are you listing?</h2>
            <p className="small muted" style={{ margin: '4px 0 14px' }}>
              Choose how you want to transact. You can sell, rent, or lend it for free.
            </p>

            <div className="type-cards">
              {LISTING_TYPES.map((t) => (
                <button
                  key={t.id}
                  className={`type-card ${type === t.id ? 'active' : ''}`}
                  onClick={() => setType(t.id)}
                >
                  <span className="t">
                    {t.id === 'sell' ? <Tag size={13} /> : t.id === 'rent' ? <CalendarDays size={13} /> : <Package size={13} />}
                    {t.label}
                  </span>
                  <span className="h">{t.hint}</span>
                </button>
              ))}
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <span className="label">Category</span>
              <div className="cat-pick">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      className={category === c.id ? 'active' : ''}
                      onClick={() => changeCategory(c.id)}
                    >
                      <Icon />
                      {c.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="sell-title">
                Listing title
              </label>
              <input
                id="sell-title"
                className="input"
                placeholder="e.g. Casio FX-991EX Scientific Calculator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
              />
              <span className="hint">{title.length}/70 · Be specific so buyers can find it.</span>
            </div>

            <div className="field">
              <label className="label" htmlFor="sell-desc">
                Description
              </label>
              <textarea
                id="sell-desc"
                className="textarea"
                placeholder="Include edition, size, inclusions, and any defects. Honest descriptions build trust."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={600}
              />
              <span className="hint">{description.length}/600</span>
            </div>

            <div className="inset row start" style={{ gap: 8, marginBottom: 14 }}>
              <ShieldCheck size={15} style={{ color: 'var(--teal-600)', marginTop: 1, flex: '0 0 auto' }} />
              <p className="tiny muted" style={{ lineHeight: 1.55 }}>
                Prohibited items include stolen property, counterfeit products, leaked exam papers,
                and anything restricted by Philippine law or campus rules. Listings may be reviewed
                and removed.
              </p>
            </div>

            <button className="btn primary block lg" onClick={next}>
              Continue to pricing <ArrowRight size={16} />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="h2">Set your price.</h2>
            <p className="small muted" style={{ margin: '4px 0 14px' }}>
              Transparent prices only, in Philippine Pesos. No hidden charges.
            </p>

            {type === 'sell' && (
              <div className="field">
                <label className="label" htmlFor="sell-price">
                  Price
                </label>
                <div className="input-wrap">
                  <span className="lead" style={{ fontWeight: 800, color: 'var(--ink)' }}>
                    ₱
                  </span>
                  <input
                    id="sell-price"
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            )}

            {type === 'rent' && (
              <>
                <div className="field">
                  <label className="label" htmlFor="sell-rent">
                    Daily rental rate
                  </label>
                  <div className="input-wrap">
                    <span className="lead" style={{ fontWeight: 800, color: 'var(--ink)' }}>
                      ₱
                    </span>
                    <input
                      id="sell-rent"
                      className="input"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="0"
                      value={rentalPerDay}
                      onChange={(e) => setRentalPerDay(e.target.value)}
                    />
                  </div>
                  <span className="hint">Charged per day for the agreed rental period.</span>
                </div>
                <div className="field">
                  <label className="label" htmlFor="sell-dep">
                    Refundable deposit <span className="opt">optional</span>
                  </label>
                  <div className="input-wrap">
                    <span className="lead" style={{ fontWeight: 800, color: 'var(--ink)' }}>
                      ₱
                    </span>
                    <input
                      id="sell-dep"
                      className="input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="0"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                    />
                  </div>
                  <span className="hint">Returned after the item is inspected and returned.</span>
                </div>
              </>
            )}

            {type === 'borrow' && (
              <div className="field">
                <label className="label" htmlFor="sell-dep">
                  Refundable deposit <span className="opt">optional</span>
                </label>
                <div className="input-wrap">
                  <span className="lead" style={{ fontWeight: 800, color: 'var(--ink)' }}>
                    ₱
                  </span>
                  <input
                    id="sell-dep"
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </div>
                <span className="hint">Borrowing is free. A deposit protects against loss or damage.</span>
              </div>
            )}

            <div className="field">
              <span className="label">Condition</span>
              <div className="row wrap" style={{ gap: 6 }}>
                {CONDITIONS.map((c) => (
                  <button
                    key={c}
                    className={`chip ${condition === c ? 'active' : ''}`}
                    onClick={() => setCondition(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {type !== 'sell' && (
              <div className="field">
                <label className="label" htmlFor="sell-terms">
                  {type === 'rent' ? 'Rental terms' : 'Borrowing terms'}
                </label>
                <textarea
                  id="sell-terms"
                  className="textarea"
                  style={{ minHeight: 84 }}
                  placeholder={
                    type === 'rent'
                      ? 'Return date, late fees, and deposit conditions…'
                      : 'Return period and condition expectations…'
                  }
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
                <span className="hint">Buyers must agree to these terms before requesting.</span>
              </div>
            )}

            <div className="fee-box">
              <div className="row between">
                <span className="k">
                  {type === 'sell' ? 'Listing price' : type === 'rent' ? 'Daily rate' : 'Borrow fee'}
                </span>
                <span className="v">
                  {type === 'sell'
                    ? peso(numericPrice)
                    : type === 'rent'
                      ? `${peso(numericRent)} / day`
                      : 'Free'}
                </span>
              </div>
              <div className="row between">
                <span className="k">CampuSmart commission (5%)</span>
                <span className="v">{type === 'borrow' ? '₱0' : `−${peso(commission)}`}</span>
              </div>
              <div className="row between total">
                <span className="k" style={{ color: '#fff' }}>
                  {type === 'rent' ? 'You earn per rental day' : 'You receive'}
                </span>
                <span className="v">{peso(payout)}</span>
              </div>
              <p className="tiny" style={{ color: 'rgba(255,255,255,0.45)', marginTop: 7, lineHeight: 1.45 }}>
                Commission is collected only on completed transactions. Deposit is refundable and is
                not included in the commission base.
              </p>
            </div>

            <button className="btn primary block lg" style={{ marginTop: 16 }} onClick={next}>
              Continue to photos <ArrowRight size={16} />
            </button>
            <button className="btn soft block" style={{ marginTop: 8 }} onClick={() => setStep(1)}>
              Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="h2">Add photos & meetup.</h2>
            <p className="small muted" style={{ margin: '4px 0 14px' }}>
              Clear photos help buyers decide. Choose a sample image for this prototype.
            </p>

            <div className="field">
              <span className="label">
                <span className="row" style={{ gap: 5 }}>
                  <Camera size={13} /> Listing photo
                </span>
                <span className="opt">Sample gallery</span>
              </span>
              <div className="image-picker">
                {choices.map((src) => (
                  <button
                    key={src}
                    className={`image-choice ${image === src ? 'active' : ''}`}
                    onClick={() => setImage(src)}
                    aria-label="Choose photo"
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
                <button
                  className="image-choice"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    background: 'var(--bg)',
                    color: 'var(--muted)',
                  }}
                  aria-label="Upload photo"
                >
                  <ImagePlus size={18} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    handleUpload(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>
              <span className="hint">Choose a sample or upload your own photo (max 1.2 MB).</span>
            </div>

            <div className="field">
              <span className="label">Safe meetup spots</span>
              {SAFE_SPOTS.map((s) => (
                <button
                  key={s.id}
                  className={`meetup-opt ${spots.includes(s.id) ? 'active' : ''}`}
                  onClick={() =>
                    setSpots((prev) =>
                      prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                    )
                  }
                >
                  <span className="radio">
                    {spots.includes(s.id) && <Check size={12} />}
                  </span>
                  <span className="grow">
                    <span className="name">{s.name}</span>
                    <span className="detail">{s.detail}</span>
                  </span>
                  <MapPin size={14} style={{ color: 'var(--muted-2)' }} />
                </button>
              ))}
            </div>

            <div className="toggle-row" style={{ marginBottom: 12 }}>
              <div>
                <div className="t">Available now</div>
                <div className="d">Buyers can see and order this listing immediately.</div>
              </div>
              <button
                className={`switch ${available ? 'on' : ''}`}
                onClick={() => setAvailable((v) => !v)}
                aria-label="Toggle availability"
                aria-pressed={available}
              />
            </div>

            <div className="eyebrow" style={{ marginBottom: 7 }}>
              Live preview
            </div>
            <div className="preview-card">
              <div className="row" style={{ gap: 11 }}>
                <img
                  src={image}
                  alt=""
                  style={{ width: 74, height: 74, borderRadius: 12, objectFit: 'cover' }}
                />
                <div className="grow">
                  <div className="row" style={{ gap: 5 }}>
                    <span className={`badge ${type === 'sell' ? 'navy' : type === 'rent' ? 'teal' : 'violet'}`}>
                      {typeLabel[type]}
                    </span>
                    <span className="badge outline">{condition}</span>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 750, marginTop: 5, lineHeight: 1.35 }}>
                    {title || 'Your listing title'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginTop: 3 }}>
                    {type === 'sell'
                      ? peso(numericPrice)
                      : type === 'rent'
                        ? `${peso(numericRent)}/day`
                        : 'Free'}{' '}
                    {type !== 'sell' && numericDeposit > 0 && (
                      <span style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 600 }}>
                        + {peso(numericDeposit)} deposit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="inset row start" style={{ margin: '12px 0', gap: 8 }}>
              <Sparkles size={14} style={{ color: 'var(--gold-600)', marginTop: 1, flex: '0 0 auto' }} />
              <p className="tiny muted" style={{ lineHeight: 1.5 }}>
                After publishing, you can boost this listing from ₱50/day for extra visibility.
                Boosting does not guarantee a sale.
              </p>
            </div>

            <button className="btn gold block lg" onClick={publish}>
              <Pencil size={15} /> {editing ? 'Save changes' : 'Publish listing'}
            </button>
            <button className="btn soft block" style={{ marginTop: 8 }} onClick={() => setStep(2)}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
