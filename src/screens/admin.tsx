import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Flag,
  Package,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp, isBoostActive } from '../store';
import {
  Avatar,
  EmptyState,
  OrderStatusBadge,
  PageHeader,
  VerifiedMark,
  useToast,
} from '../components/ui';
import { CountUp } from '../components/motion';
import { peso, shortDate, timeAgo } from '../lib/format';
import type { Report } from '../types';

type Tab = 'overview' | 'verifications' | 'listings' | 'reports';

export function AdminScreen() {
  const navigate = useNavigate();
  const { state, approveUser, rejectUser, updateListing, resolveReport } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'boosted' | 'removed'>(
    'all',
  );

  const pending = state.users.filter((u) => u.status === 'pending');
  const openReports = state.reports.filter((r) => r.status === 'open');
  const completed = state.orders.filter((o) => o.status === 'completed');
  const activeListings = state.listings.filter((l) => l.available);
  const verifiedUsers = state.users.filter((u) => u.status === 'verified');
  const commission = completed.reduce((sum, o) => sum + o.commission, 0);
  const boostRevenue = state.boosts.reduce((sum, b) => sum + b.amount, 0);
  const gmv = completed.reduce((sum, o) => sum + o.subtotal, 0);
  const revenue = commission + boostRevenue;
  const commissionPct = revenue ? Math.round((commission / revenue) * 100) : 0;

  const listings = useMemo(() => {
    let list = [...state.listings].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    if (listingFilter === 'active') list = list.filter((l) => l.available);
    if (listingFilter === 'removed') list = list.filter((l) => !l.available);
    if (listingFilter === 'boosted') list = list.filter(isBoostActive);
    return list;
  }, [state.listings, listingFilter]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'verifications', label: 'Verifications', count: pending.length },
    { id: 'listings', label: 'Listings' },
    { id: 'reports', label: 'Reports', count: openReports.length },
  ];

  return (
    <div className="screen">
      <PageHeader
        title="Administrator"
        subtitle="MMCL campus marketplace"
        backTo="/profile"
        right={
          <span className="badge navy" style={{ gap: 4 }}>
            <ShieldCheck size={10} /> Admin
          </span>
        }
      />

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="badge gold" style={{ height: 17, padding: '0 5px', fontSize: 8.5 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="page tight" style={{ paddingTop: 14 }}>
        {tab === 'overview' && (
          <>
            <div className="row between" style={{ marginBottom: 10 }}>
              <h2 className="h3">Pilot at a glance</h2>
              <span className="badge outline">Last 30 days</span>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="k">Gross merchandise value</div>
                <div className="v">
                  <CountUp value={gmv} prefix="₱" />
                </div>
                <div className="d">{completed.length} completed transactions</div>
              </div>
              <div className="stat-card">
                <div className="k">5% commission</div>
                <div className="v">
                  <CountUp value={commission} prefix="₱" />
                </div>
                <div className="d">Seller-based revenue</div>
              </div>
              <div className="stat-card">
                <div className="k">Post boosting</div>
                <div className="v">
                  <CountUp value={boostRevenue} prefix="₱" />
                </div>
                <div className="d">{state.boosts.length} paid promotions</div>
              </div>
              <div className="stat-card dark">
                <div className="k">Total revenue</div>
                <div className="v">
                  <CountUp value={revenue} prefix="₱" />
                </div>
                <div className="d">Commission + boosts</div>
              </div>
            </div>

            {(pending.length > 0 || openReports.length > 0) && (
              <div className="card pad" style={{ marginTop: 12, borderColor: '#dcd2b8', background: '#fffdf6' }}>
                <div className="row" style={{ gap: 7, marginBottom: 9 }}>
                  <AlertTriangle size={15} style={{ color: 'var(--gold-600)' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 800 }}>Needs your attention</span>
                </div>
                {pending.length > 0 && (
                  <button
                    className="row between"
                    style={{ width: '100%', padding: '7px 0', borderBottom: openReports.length > 0 ? '1px solid #f3e7c8' : 'none' }}
                    onClick={() => setTab('verifications')}
                  >
                    <span className="row" style={{ gap: 7, fontSize: 11.5 }}>
                      <ClipboardCheck size={14} /> {pending.length} account
                      {pending.length === 1 ? '' : 's'} awaiting verification
                    </span>
                    <ChevronRight size={15} />
                  </button>
                )}
                {openReports.length > 0 && (
                  <button
                    className="row between"
                    style={{ width: '100%', padding: '7px 0 2px' }}
                    onClick={() => setTab('reports')}
                  >
                    <span className="row" style={{ gap: 7, fontSize: 11.5 }}>
                      <Flag size={14} /> {openReports.length} open report
                      {openReports.length === 1 ? '' : 's'}
                    </span>
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>
            )}

            <div className="card pad" style={{ marginTop: 12 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <h3 className="h4">Revenue mix</h3>
                <span className="badge gray">{peso(revenue)} total</span>
              </div>
              <div style={{ height: 9, borderRadius: 999, background: 'var(--bg-2)', display: 'flex', overflow: 'hidden' }}>
                <span
                  style={{
                    width: `${commissionPct}%`,
                    background: 'var(--navy-700)',
                    transition: 'width 0.6s ease',
                  }}
                />
                <span style={{ flex: 1, background: 'var(--gold-500)' }} />
              </div>
              <div className="row between" style={{ marginTop: 8 }}>
                <span className="row tiny muted" style={{ gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--navy-700)' }} />
                  Commission {peso(commission)} ({commissionPct}%)
                </span>
                <span className="row tiny muted" style={{ gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--gold-500)' }} />
                  Boosts {peso(boostRevenue)}
                </span>
              </div>
            </div>

            <div className="stat-grid" style={{ marginTop: 12 }}>
              <div className="stat-card">
                <div className="k">Verified members</div>
                <div className="v">{verifiedUsers.length}</div>
                <div className="d">{pending.length} pending</div>
              </div>
              <div className="stat-card">
                <div className="k">Active listings</div>
                <div className="v">{activeListings.length}</div>
                <div className="d">{state.listings.length} total</div>
              </div>
              <div className="stat-card">
                <div className="k">Open reports</div>
                <div className="v">{openReports.length}</div>
                <div className="d">Moderation queue</div>
              </div>
              <div className="stat-card">
                <div className="k">Boosted now</div>
                <div className="v">{state.listings.filter(isBoostActive).length}</div>
                <div className="d">Active promotions</div>
              </div>
            </div>

            <div className="card pad" style={{ marginTop: 12 }}>
              <div className="row between" style={{ marginBottom: 4 }}>
                <h3 className="h4">Projected monthly scenarios</h3>
                <span className="badge outline">From proposal</span>
              </div>
              <p className="tiny muted" style={{ marginBottom: 10, lineHeight: 1.5 }}>
                Financial projections at 200–300 transactions per month. Operating expenses are
                ₱4,000.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                  <thead>
                    <tr style={{ color: 'var(--muted-2)', textAlign: 'left' }}>
                      <th style={{ padding: '4px 0', fontWeight: 700 }}>Metric</th>
                      <th style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>Initial</th>
                      <th style={{ padding: '4px 0', textAlign: 'right', fontWeight: 700 }}>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Transactions', '200', '300'],
                      ['Avg. value', '₱250', '₱300'],
                      ['Revenue', '₱3,000', '₱5,500'],
                      ['Expenses', '₱4,000', '₱4,000'],
                      ['Net', '−₱1,000', '+₱1,500'],
                    ].map((row, i) => (
                      <tr key={row[0]} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '6px 0', color: i === 4 ? 'var(--ink)' : 'var(--muted)', fontWeight: i === 4 ? 800 : 500 }}>
                          {row[0]}
                        </td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: i === 4 ? 800 : 600 }}>
                          {row[1]}
                        </td>
                        <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: i === 4 ? 800 : 600, color: i === 4 ? 'var(--success)' : 'inherit' }}>
                          {row[2]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card pad" style={{ marginTop: 12 }}>
              <h3 className="h4" style={{ marginBottom: 9 }}>
                Platform health · TQM targets
              </h3>
              {[
                ['System uptime', '99.5%', 99.5],
                ['Support resolved < 24h', '96%', 96],
                ['Session crashes', '0.6%', 99.4],
              ].map(([label, value, pct]) => (
                <div key={label as string} style={{ marginBottom: 9 }}>
                  <div className="row between" style={{ fontSize: 10.5, marginBottom: 3 }}>
                    <span className="muted">{label}</span>
                    <span style={{ fontWeight: 750 }}>{value}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: 'var(--bg-2)' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: 999,
                        background: 'var(--teal-600)',
                      }}
                    />
                  </div>
                </div>
              ))}
              <p className="tiny muted" style={{ marginTop: 2 }}>
                Reviewed every term with the Plan–Do–Check–Act cycle.
              </p>
            </div>

            <div className="card pad" style={{ marginTop: 12 }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <h3 className="h4">Recent completed transactions</h3>
                <button className="link" style={{ fontSize: 10.5 }} onClick={() => navigate('/orders')}>
                  All orders
                </button>
              </div>
              {completed.slice(0, 4).map((o) => (
                <button
                  key={o.id}
                  className="row between"
                  style={{ width: '100%', padding: '8px 0', borderTop: '1px solid var(--line)', textAlign: 'left' }}
                  onClick={() => navigate(`/order/${o.id}`)}
                >
                  <span className="row" style={{ gap: 8 }}>
                    <img src={o.lines[0]?.image} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} />
                    <span>
                      <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700 }}>
                        {o.lines[0]?.title.slice(0, 32)}
                      </span>
                      <span className="tiny muted">
                        {timeAgo(o.createdAt)} · fee {peso(o.commission)}
                      </span>
                    </span>
                  </span>
                  <span className="row" style={{ gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{peso(o.total)}</span>
                    <ChevronRight size={13} style={{ color: 'var(--muted-2)' }} />
                  </span>
                </button>
              ))}
              {completed.length === 0 && (
                <p className="tiny muted">No completed transactions yet.</p>
              )}
            </div>
          </>
        )}

        {tab === 'verifications' && (
          <>
            <div className="row between" style={{ marginBottom: 4 }}>
              <div>
                <h2 className="h3">Verification queue</h2>
                <p className="tiny muted" style={{ marginTop: 2 }}>
                  Confirm campus affiliation within 24 hours.
                </p>
              </div>
              <span className="badge gold">{pending.length} pending</span>
            </div>

            {pending.length === 0 ? (
              <EmptyState
                icon={<BadgeCheck size={30} />}
                title="All clear"
                body="No accounts are waiting for verification. New @mcl.edu.ph registrations will appear here."
                action="Review listings"
                onAction={() => setTab('listings')}
              />
            ) : (
              <div className="card pad" style={{ marginTop: 10 }}>
                {pending.map((u) => (
                  <div className="verify-row" key={u.id} style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Avatar user={u} />
                    <div className="grow" style={{ minWidth: 160 }}>
                      <div className="name row" style={{ gap: 5 }}>
                        {u.name}
                        <span className="badge gray" style={{ height: 17, padding: '0 5px', fontSize: 8 }}>
                          {u.role}
                        </span>
                      </div>
                      <div className="email">{u.email}</div>
                      <div className="meta">
                        {u.department} · submitted {u.submittedAt ? timeAgo(u.submittedAt) : 'today'}
                      </div>
                      <div className="row" style={{ gap: 6, marginTop: 7 }}>
                        <button
                          className="btn sm primary"
                          onClick={() => {
                            approveUser(u.id);
                            toast(`${u.name} is now a verified campus member.`, 'success');
                          }}
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          className="btn sm danger"
                          onClick={() => {
                            rejectUser(u.id);
                            toast(`${u.name}'s registration was rejected.`, 'error');
                          }}
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="h4" style={{ margin: '18px 0 6px' }}>
              Recently verified
            </h3>
            <div className="card pad" style={{ paddingTop: 2, paddingBottom: 2 }}>
              {verifiedUsers
                .filter((u) => u.role !== 'admin')
                .slice(-4)
                .reverse()
                .map((u) => (
                  <div className="row" key={u.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                    <Avatar user={u} size="sm" />
                    <div className="grow">
                      <div style={{ fontSize: 11.5, fontWeight: 700 }}>{u.name}</div>
                      <div className="tiny muted">{u.email}</div>
                    </div>
                    <span className="badge green" style={{ height: 18, fontSize: 8.5 }}>
                      <VerifiedMark /> Verified
                    </span>
                  </div>
                ))}
            </div>

            <div className="form-alert info" style={{ marginTop: 12 }}>
              <Clock3 size={15} style={{ marginTop: 1, flex: '0 0 auto' }} />
              <span>
                Registrations are restricted to @mcl.edu.ph. If information cannot be verified,
                reject the request or ask for additional details through the Student Affairs Office.
              </span>
            </div>
          </>
        )}

        {tab === 'listings' && (
          <>
            <div className="row between" style={{ marginBottom: 8 }}>
              <div>
                <h2 className="h3">Listing moderation</h2>
                <p className="tiny muted" style={{ marginTop: 2 }}>
                  Review reported or prohibited items.
                </p>
              </div>
            </div>

            <div className="scroll-x" style={{ margin: 0, padding: '0 0 8px' }}>
              {(
                [
                  ['all', 'All'],
                  ['active', 'Live'],
                  ['boosted', 'Boosted'],
                  ['removed', 'Removed'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  className={`chip ${listingFilter === id ? 'active' : ''}`}
                  style={{ minHeight: 32, fontSize: 11 }}
                  onClick={() => setListingFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {listings.length === 0 ? (
              <EmptyState
                icon={<Package size={30} />}
                title="No listings here"
                body="No listings match this filter."
              />
            ) : (
              <div className="card pad" style={{ paddingTop: 2, paddingBottom: 2 }}>
                {listings.map((l) => {
                  const seller = state.users.find((u) => u.id === l.sellerId);
                  const boost = isBoostActive(l);
                  const reportCount = state.reports.filter(
                    (r) => r.listingId === l.id && r.status === 'open',
                  ).length;
                  return (
                    <div className="mini-listing" key={l.id} style={{ alignItems: 'flex-start' }}>
                      <img src={l.image} alt="" />
                      <div className="grow">
                        <button style={{ textAlign: 'left' }} onClick={() => navigate(`/product/${l.id}`)}>
                          <div className="t">{l.title}</div>
                        </button>
                        <div className="meta" style={{ marginTop: 3 }}>
                          {seller?.name} · {shortDate(l.createdAt)}
                        </div>
                        <div className="row wrap" style={{ gap: 4, marginTop: 5 }}>
                          <span className={`badge ${l.available ? 'green' : 'gray'}`} style={{ height: 17, fontSize: 8 }}>
                            {l.available ? 'Live' : 'Removed'}
                          </span>
                          {boost && (
                            <span className="badge gold" style={{ height: 17, fontSize: 8 }}>
                              <Sparkles size={8} /> Boosted
                            </span>
                          )}
                          {reportCount > 0 && (
                            <span className="badge red" style={{ height: 17, fontSize: 8 }}>
                              <Flag size={8} /> {reportCount} report
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col" style={{ gap: 5, alignItems: 'flex-end' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 800 }}>
                          {l.type === 'sell'
                            ? peso(l.price)
                            : l.type === 'rent'
                              ? `${peso(l.rentalPerDay ?? 0)}/d`
                              : 'Free'}
                        </span>
                        <button
                          className={`btn sm ${l.available ? 'danger' : 'soft'}`}
                          onClick={() => {
                            updateListing(l.id, { available: !l.available });
                            toast(l.available ? 'Listing removed from the marketplace.' : 'Listing restored.');
                          }}
                        >
                          {l.available ? 'Remove' : 'Restore'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'reports' && (
          <>
            <div className="row between" style={{ marginBottom: 4 }}>
              <div>
                <h2 className="h3">Reports & disputes</h2>
                <p className="tiny muted" style={{ marginTop: 2 }}>
                  Review evidence and take appropriate action.
                </p>
              </div>
              <span className={`badge ${openReports.length ? 'red' : 'green'}`}>
                {openReports.length} open
              </span>
            </div>

            {state.reports.length === 0 ? (
              <EmptyState
                icon={<Flag size={30} />}
                title="No reports"
                body="Reported listings, accounts, and transaction concerns will appear here."
              />
            ) : (
              <div className="col" style={{ gap: 9, marginTop: 10 }}>
                {[...state.reports]
                  .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                  .map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onResolve={(remove) => {
                        resolveReport(report.id, 'resolved', remove);
                        toast(
                          remove
                            ? 'Report resolved and listing removed.'
                            : 'Report resolved. Reporter notified.',
                          'success',
                        );
                      }}
                      onDismiss={() => {
                        resolveReport(report.id, 'dismissed');
                        toast('Report dismissed. No violation found.');
                      }}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReportCard({
  report,
  onResolve,
  onDismiss,
}: {
  report: Report;
  onResolve: (removeListing: boolean) => void;
  onDismiss: () => void;
}) {
  const navigate = useNavigate();
  const { state } = useApp();
  const reporter = state.users.find((u) => u.id === report.reporterId);
  const listing = state.listings.find((l) => l.id === report.listingId);
  const target = state.users.find((u) => u.id === report.targetUserId);

  return (
    <div className="card pad">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <span className="row" style={{ gap: 8 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: report.status === 'open' ? 'var(--danger-soft)' : 'var(--bg-2)',
              color: report.status === 'open' ? 'var(--danger)' : 'var(--muted)',
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <Flag size={15} />
          </span>
          <span>
            <span style={{ display: 'block', fontSize: 12.5, fontWeight: 800 }}>{report.reason}</span>
            <span className="tiny muted">
              by {reporter?.name.split(' ')[0] ?? 'a member'} · {timeAgo(report.createdAt)}
            </span>
          </span>
        </span>
        <OrderStatusBadge status={report.status} />
      </div>

      <p style={{ fontSize: 11, lineHeight: 1.55, color: 'var(--ink-2)', marginTop: 9 }}>
        {report.details}
      </p>

      {listing && (
        <button
          className="row"
          style={{ marginTop: 8, gap: 8, textAlign: 'left', width: '100%' }}
          onClick={() => navigate(`/product/${listing.id}`)}
        >
          <img src={listing.image} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }} />
          <span className="grow" style={{ fontSize: 10.5, fontWeight: 700 }}>
            {listing.title}
          </span>
          <ChevronRight size={14} style={{ color: 'var(--muted-2)' }} />
        </button>
      )}
      {target && (
        <div className="inset row" style={{ gap: 7, marginTop: 8 }}>
          <Avatar user={target} size="sm" />
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>{target.name}</span>
          <span className="tiny muted">· reported account</span>
        </div>
      )}

      {report.status === 'open' ? (
        <div className="order-actions" style={{ marginTop: 10 }}>
          <button className="btn sm primary" onClick={() => onResolve(false)}>
            <Check size={12} /> Resolve
          </button>
          {listing && (
            <button className="btn sm danger" onClick={() => onResolve(true)}>
              <X size={12} /> Remove listing
            </button>
          )}
          <button className="btn sm soft" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      ) : (
        report.resolution && (
          <div className="inset" style={{ marginTop: 9 }}>
            <span className="tiny muted" style={{ lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--ink)' }}>Resolution:</strong> {report.resolution}
            </span>
          </div>
        )
      )}
    </div>
  );
}
