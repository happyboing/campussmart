import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Clock3,
  Flag,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../components/ui';
import { POLICIES, POLICY_SLUGS, type PolicySlug } from '../data/catalog';

export function PolicyScreen() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const key = (POLICY_SLUGS as readonly string[]).includes(slug ?? '')
    ? (slug as PolicySlug)
    : 'terms';
  const policy = POLICIES[key];

  return (
    <div className="screen">
      <PageHeader title={policy.title} subtitle={policy.eyebrow} backTo="/profile" />

      <div className="page tight" style={{ paddingTop: 10 }}>
        <div
          className="card pad"
          style={{
            background:
              'radial-gradient(180px 130px at 92% 0%, rgba(45,47,191,0.18), transparent 70%), linear-gradient(145deg, #2d2fbf, #1b1c5a)',
            color: '#fff',
            border: 'none',
          }}
        >
          <span className="badge" style={{ background: 'rgba(45,47,191,0.16)', color: '#f7ebc6' }}>
            <ShieldCheck size={11} /> CampuSmart policy
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 9 }}>
            {policy.title}
          </h1>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 5, lineHeight: 1.5 }}>
            {policy.eyebrow} · Updated {policy.updated}
          </p>
        </div>

        <div className="card pad" style={{ marginTop: 12 }}>
          {policy.sections.map((section) => (
            <section className="policy-section" key={section.heading}>
              <h3>{section.heading}</h3>
              {section.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </div>

        {key === 'meetups' && (
          <div className="card pad" style={{ marginTop: 12 }}>
            <h3 className="h4" style={{ marginBottom: 8 }}>
              Designated spots
            </h3>
            {[
              ['ET Yuchengco Building Lobby', 'Ground floor · well-lit · CCTV monitored'],
              ['Library Entrance', 'Main library doors · guard on duty'],
              ['Student Lounge', 'Near the canteen · high foot traffic'],
            ].map(([name, detail]) => (
              <div className="row" key={name} style={{ gap: 9, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: 'var(--teal-100)',
                    color: 'var(--teal-700)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <MapPin size={14} />
                </span>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 750 }}>{name}</div>
                  <div className="tiny muted">{detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="eyebrow" style={{ margin: '18px 2px 7px' }}>
          Other policies
        </div>
        <div className="menu-group">
          {POLICY_SLUGS.filter((s) => s !== key).map((s) => (
            <button className="menu-item" key={s} onClick={() => navigate(`/policies/${s}`)}>
              <span className="icon">
                <BookOpen size={16} />
              </span>
              <span className="grow">
                <span className="label">{POLICIES[s].title}</span>
                <span className="sub">{POLICIES[s].eyebrow}</span>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>

        <div className="card pad" style={{ marginTop: 12 }}>
          <div className="row start" style={{ gap: 9 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--gold-100)',
                color: 'var(--gold-600)',
                display: 'grid',
                placeItems: 'center',
                flex: '0 0 auto',
              }}
            >
              <Flag size={16} />
            </span>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 750 }}>Need help or want to report?</div>
              <p className="tiny muted" style={{ marginTop: 3, lineHeight: 1.5 }}>
                Use the Report button on any listing or chat, or contact the Student Affairs Office.
                Reports are reviewed by the CampuSmart administrator.
              </p>
              <div className="row wrap" style={{ gap: 10, marginTop: 7 }}>
                <span className="row tiny" style={{ gap: 4 }}>
                  <Mail size={11} /> support@campussmart.ph
                </span>
                <span className="row tiny" style={{ gap: 4 }}>
                  <Clock3 size={11} /> Replies within 24h
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="hint center" style={{ marginTop: 14, lineHeight: 1.6 }}>
          CampuSmart · Mapúa Malayan Colleges Laguna
          <br />
          Aligned with RA 10173, RA 11967, RA 8792, and the MMCL Student Handbook.
        </p>
      </div>
    </div>
  );
}
