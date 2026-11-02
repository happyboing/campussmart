import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp, isBoostActive } from '../store';
import { CATEGORIES, categoryById } from '../data/catalog';
import type { CategoryId, ItemCondition, ListingType } from '../types';
import { ProductCard, EmptyState, Sheet } from '../components/ui';
import { CartButton } from '../components/layout';
import { typeLabel } from '../lib/format';

const CONDITIONS: ItemCondition[] = ['New', 'Like new', 'Good', 'Fair'];
const TYPES: { id: 'all' | ListingType; label: string }[] = [
  { id: 'all', label: 'All types' },
  { id: 'sell', label: 'For sale' },
  { id: 'rent', label: 'For rent' },
  { id: 'borrow', label: 'Borrow' },
];

interface Filters {
  type: 'all' | ListingType;
  category: 'all' | CategoryId;
  condition: 'all' | ItemCondition;
  min: string;
  max: string;
  boosted: boolean;
}

const DEFAULT_FILTERS: Filters = {
  type: 'all',
  category: 'all',
  condition: 'all',
  min: '',
  max: '',
  boosted: false,
};

type Sort = 'latest' | 'price-asc' | 'price-desc' | 'boosted';

export function ExploreScreen() {
  const [params] = useSearchParams();
  const { state } = useApp();
  const initialCategory = (params.get('category') as CategoryId | null) ?? 'all';
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState<Sort>((params.get('sort') as Sort) ?? 'latest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    category: initialCategory,
  });
  const [draft, setDraft] = useState<Filters>(filters);

  const activeFilters =
    (filters.type !== 'all' ? 1 : 0) +
    (filters.category !== 'all' ? 1 : 0) +
    (filters.condition !== 'all' ? 1 : 0) +
    (filters.min ? 1 : 0) +
    (filters.max ? 1 : 0) +
    (filters.boosted ? 1 : 0);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = state.listings.filter((l) => l.available);
    if (term) {
      list = list.filter((l) =>
        [l.title, l.description, categoryById(l.category).name]
          .join(' ')
          .toLowerCase()
          .includes(term),
      );
    }
    if (filters.type !== 'all') list = list.filter((l) => l.type === filters.type);
    if (filters.category !== 'all') list = list.filter((l) => l.category === filters.category);
    if (filters.condition !== 'all') list = list.filter((l) => l.condition === filters.condition);
    const effective = (price: number, rental?: number) =>
      rental !== undefined ? rental : price;
    if (filters.min) list = list.filter((l) => effective(l.price, l.rentalPerDay) >= Number(filters.min));
    if (filters.max) list = list.filter((l) => effective(l.price, l.rentalPerDay) <= Number(filters.max));
    if (filters.boosted) list = list.filter(isBoostActive);

    const sorted = [...list];
    if (sort === 'latest') sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === 'boosted')
      sorted.sort((a, b) => {
        const ab = isBoostActive(a) ? 1 : 0;
        const bb = isBoostActive(b) ? 1 : 0;
        return bb - ab || +new Date(b.createdAt) - +new Date(a.createdAt);
      });
    if (sort === 'price-asc')
      sorted.sort(
        (a, b) => (a.rentalPerDay ?? a.price) - (b.rentalPerDay ?? b.price),
      );
    if (sort === 'price-desc')
      sorted.sort(
        (a, b) => (b.rentalPerDay ?? b.price) - (a.rentalPerDay ?? a.price),
      );
    return sorted;
  }, [state.listings, q, filters, sort]);

  const openFilters = () => {
    setDraft(filters);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(draft);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const activeCategoryName =
    filters.category === 'all' ? null : categoryById(filters.category).short;

  return (
    <div className="screen">
      <div
        className="row between"
        style={{ padding: '18px 24px 10px', gap: 10 }}
      >
        <div>
          <span className="eyebrow">MMCL marketplace</span>
          <h1 className="h2" style={{ marginTop: 1 }}>
            Explore campus
          </h1>
        </div>
        <CartButton />
      </div>

      <div className="explore-head">
        <div className="search-bar inline" style={{ paddingRight: 6 }}>
          <Search size={18} />
          <input
            placeholder="Search the marketplace"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search listings"
          />
          {q && (
            <button
              className="icon-btn"
              style={{ width: 30, height: 30 }}
              onClick={() => setQ('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button
            className="filter-btn"
            onClick={openFilters}
            aria-label={`Filters${activeFilters ? `, ${activeFilters} active` : ''}`}
          >
            <SlidersHorizontal size={15} />
            {activeFilters > 0 && <span className="filter-active">{activeFilters}</span>}
          </button>
        </div>
      </div>

      <div
        className="scroll-x"
        style={{ padding: '13px 24px 6px', margin: 0, scrollPaddingLeft: 24 }}
      >
        <button
          className={`chip ${filters.category === 'all' ? 'active' : ''}`}
          onClick={() => setFilters((f) => ({ ...f, category: 'all' }))}
        >
          All items
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`chip ${filters.category === c.id ? 'active' : ''}`}
            onClick={() => setFilters((f) => ({ ...f, category: c.id }))}
          >
            {c.short}
          </button>
        ))}
      </div>

      <div className="result-bar">
        <span className="count">
          <strong>{results.length}</strong> {results.length === 1 ? 'item' : 'items'}
          {activeCategoryName ? ` in ${activeCategoryName}` : ''}
          {q ? ` for “${q}”` : ''}
        </span>
        <div className="select-wrap">
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sort listings"
            style={{ paddingRight: 26 }}
          >
            <option value="latest">Latest</option>
            <option value="boosted">Boosted first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <SlidersHorizontal size={12} style={{ right: 9 }} />
        </div>
      </div>

      {activeFilters > 0 && (
        <div className="row wrap" style={{ padding: '0 24px 8px', gap: 6 }}>
          {filters.type !== 'all' && (
            <span className="badge navy">
              {typeLabel[filters.type]}
              <button
                onClick={() => setFilters((f) => ({ ...f, type: 'all' }))}
                aria-label="Remove type filter"
                style={{ color: 'inherit', display: 'flex' }}
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.condition !== 'all' && (
            <span className="badge gray">
              {filters.condition}
              <button
                onClick={() => setFilters((f) => ({ ...f, condition: 'all' }))}
                aria-label="Remove condition filter"
                style={{ color: 'inherit', display: 'flex' }}
              >
                <X size={10} />
              </button>
            </span>
          )}
          {filters.boosted && (
            <span className="badge gold">
              <Sparkles size={10} /> Boosted
              <button
                onClick={() => setFilters((f) => ({ ...f, boosted: false }))}
                aria-label="Remove boosted filter"
                style={{ color: 'inherit', display: 'flex' }}
              >
                <X size={10} />
              </button>
            </span>
          )}
          {(filters.min || filters.max) && (
            <span className="badge gray">
              ₱{filters.min || '0'}–{filters.max ? `₱${filters.max}` : 'any'}
              <button
                onClick={() => setFilters((f) => ({ ...f, min: '', max: '' }))}
                aria-label="Remove price filter"
                style={{ color: 'inherit', display: 'flex' }}
              >
                <X size={10} />
              </button>
            </span>
          )}
          <button
            className="tiny bold"
            style={{ color: 'var(--navy-500)', marginLeft: 2 }}
            onClick={resetFilters}
          >
            Clear all
          </button>
        </div>
      )}

      {results.length ? (
        <div className="grid-2" style={{ padding: '4px 24px 20px' }}>
          {results.map((l) => (
            <ProductCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PackageSearch size={30} />}
          title="No items match yet"
          body="Try a different keyword, category, or price range. New listings appear every day."
          action="Clear filters"
          onAction={() => {
            setQ('');
            resetFilters();
          }}
        />
      )}

      <Sheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        subtitle="Narrow down campus listings"
        right={
          <button
            className="btn sm soft"
            onClick={() => {
              setDraft(DEFAULT_FILTERS);
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        }
      >
        <div className="filter-sheet">
          <div className="filter-block">
            <h4 className="h4">Transaction type</h4>
            <div className="row wrap" style={{ gap: 6 }}>
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  className={`chip ${draft.type === t.id ? 'active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, type: t.id }))}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <h4 className="h4">Category</h4>
            <div className="row wrap" style={{ gap: 6 }}>
              <button
                className={`chip ${draft.category === 'all' ? 'active' : ''}`}
                onClick={() => setDraft((d) => ({ ...d, category: 'all' }))}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`chip ${draft.category === c.id ? 'active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, category: c.id }))}
                >
                  {c.short}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <h4 className="h4">Condition</h4>
            <div className="row wrap" style={{ gap: 6 }}>
              <button
                className={`chip ${draft.condition === 'all' ? 'active' : ''}`}
                onClick={() => setDraft((d) => ({ ...d, condition: 'all' }))}
              >
                Any
              </button>
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  className={`chip ${draft.condition === c ? 'active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, condition: c }))}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-block">
            <h4 className="h4">Price range (₱)</h4>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={draft.min}
                onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
                aria-label="Minimum price"
              />
              <span className="muted">–</span>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={draft.max}
                onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
                aria-label="Maximum price"
              />
            </div>
            <p className="hint" style={{ marginTop: 6 }}>
              For rentals, this compares the daily rate.
            </p>
          </div>

          <label className="check" style={{ marginBottom: 18 }}>
            <input
              type="checkbox"
              checked={draft.boosted}
              onChange={(e) => setDraft((d) => ({ ...d, boosted: e.target.checked }))}
            />
            <span>
              Show <strong>boosted listings</strong> only. Promotions add visibility but do not
              guarantee a sale.
            </span>
          </label>

          <button className="btn gold block lg" onClick={applyFilters}>
            Show {results.length} results
          </button>
          <button
            className="btn ghost block"
            style={{ marginTop: 4 }}
            onClick={() => setFilterOpen(false)}
          >
            Cancel
          </button>
        </div>
      </Sheet>
    </div>
  );
}
