import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Camera,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Clock3,
  X,
} from 'lucide-react';
import { useApp } from '../store';
import { DEMO_ACCOUNTS } from '../data/seed';
import { Sheet, useToast, Wordmark } from '../components/ui';
import { DEPARTMENTS } from '../data/catalog';

/* ------------------------------------------------------------------ welcome */

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  useEffect(() => {
    if (currentUser) navigate('/home', { replace: true });
  }, [currentUser, navigate]);

  return (
    <div className="welcome welcome-minimal">
      <div className="welcome-aura" aria-hidden="true">
        <span className="aura aura-one" />
        <span className="aura aura-two" />
        <span className="aura aura-three" />
        <span className="aura aura-four" />
      </div>

      <div className="welcome-sparks" aria-hidden="true">
        <span className="spark spark-1" />
        <span className="spark spark-2" />
        <span className="spark spark-3" />
        <span className="spark spark-4" />
      </div>

      <div className="welcome-center">
        <div className="welcome-logo-wrap">
          <img
            className="welcome-logo"
            src="/img/logo.png"
            alt="CampuSmart — Your Campus, Your Marketplace"
          />
        </div>
        <p className="welcome-tagline">Your Campus, Your Marketplace.</p>
      </div>

      <div className="welcome-actions">
        <button className="btn gold block lg" onClick={() => navigate('/register')}>
          Create a free account <ArrowRight size={17} />
        </button>
        <button
          className="btn white block lg"
          style={{ marginTop: 9 }}
          onClick={() => navigate('/login')}
        >
          I already have an account
        </button>
        <p className="welcome-legal">
          <Link to="/policies/terms">Terms</Link>
          <span>·</span>
          <Link to="/policies/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ login */

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, loginAs } = useApp();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [faceOpen, setFaceOpen] = useState(false);
  const [facePhase, setFacePhase] = useState<'scan' | 'ok'>('scan');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your institutional email and password.');
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const result = login(email, password);
      setBusy(false);
      if (!result.ok) {
        if (result.pending) {
          navigate('/pending');
        } else {
          setError(result.error ?? 'Unable to sign in.');
        }
        return;
      }
      navigate('/home');
    }, 350);
  };

  const quickFill = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('CampuSmart123');
    setError('');
  };

  const startFace = () => {
    setFaceOpen(true);
    setFacePhase('scan');
    window.setTimeout(() => setFacePhase('ok'), 1900);
    window.setTimeout(() => {
      loginAs('u1');
      setFaceOpen(false);
      toast('Face ID verified. Welcome back, Kaira!', 'success');
      navigate('/home');
    }, 2750);
  };

  return (
    <div className="auth">
      <div className="auth-top">
        <Link to="/" aria-label="Back to welcome">
          <span className="auth-brand">
            <Wordmark light height={28} />
          </span>
        </Link>
        <button className="icon-btn light" onClick={() => navigate('/')} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="auth-hero">
        <span className="eyebrow" style={{ color: '#f7ebc6' }}>
          Verified campus community
        </span>
        <h1>Welcome back.</h1>
        <p>Sign in with your institutional account to continue to the marketplace.</p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <h2 className="h2">Sign in</h2>
        <p className="small muted" style={{ marginTop: 3, marginBottom: 16 }}>
          Use your <strong style={{ color: 'var(--ink)' }}>@mcl.edu.ph</strong> email.
        </p>

        {error && (
          <div className="form-alert error">
            <LockKeyhole size={14} style={{ marginTop: 1, flex: '0 0 auto' }} />
            <span>{error}</span>
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="login-email">
            Institutional email
          </label>
          <div className="input-wrap">
            <span className="lead">
              <Mail size={16} />
            </span>
            <input
              id="login-email"
              className={`input ${error ? 'error' : ''}`}
              placeholder="name@mcl.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="login-pass">
            Password
            <button
              type="button"
              className="opt"
              style={{ color: 'var(--navy-500)', fontWeight: 700 }}
              onClick={() => toast('Password reset is handled by the Student Affairs Office in this pilot.')}
            >
              Forgot password?
            </button>
          </label>
          <div className="input-wrap">
            <span className="lead">
              <LockKeyhole size={16} />
            </span>
            <input
              id="login-pass"
              className={`input has-trail ${error ? 'error' : ''}`}
              type={show ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <span className="trail">
              <button
                type="button"
                className="icon-btn"
                style={{ width: 34, height: 34 }}
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </div>
        </div>

        <button className="btn primary block lg" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="row" style={{ margin: '13px 0 11px' }}>
          <span style={{ height: 1, background: 'var(--line)', flex: 1 }} />
          <span className="tiny muted">or</span>
          <span style={{ height: 1, background: 'var(--line)', flex: 1 }} />
        </div>

        <button className="btn outline block" type="button" onClick={startFace}>
          <ScanFace size={18} /> Sign in with Face ID
        </button>
        <p className="hint center" style={{ marginTop: 8 }}>
          Available after admin verification. Face data stays on your device.
        </p>
      </form>

      <div className="demo-box">
        <div className="eyebrow">Evaluator demo accounts · password CampuSmart123</div>
        <div className="demo-list">
          {DEMO_ACCOUNTS.map((acc) => (
            <button key={acc.id} className="demo-btn" onClick={() => quickFill(acc.email)}>
              <span
                className="badge"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.72)' }}
              >
                {acc.label}
              </span>
              <span className="role">{acc.name}</span>
              <span className="name">{acc.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="auth-foot">
        New to CampuSmart?{' '}
        <button onClick={() => navigate('/register')}>Create an account</button>
      </div>

      <Sheet
        open={faceOpen}
        onClose={() => setFaceOpen(false)}
        title="Face ID"
        subtitle="Look at your camera to sign in"
      >
        <div className={`scan-stage ${facePhase === 'ok' ? 'ok' : ''}`}>
          {facePhase === 'ok' ? (
            <span
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                zIndex: 2,
              }}
            >
              <Check size={32} />
            </span>
          ) : (
            <ScanFace size={92} strokeWidth={1} className="scan-face" />
          )}
          {facePhase === 'scan' && <span className="scan-line" />}
        </div>
        <p className="center small muted" style={{ marginBottom: 8 }}>
          {facePhase === 'ok'
            ? 'Identity confirmed. Signing you in…'
            : 'Scanning your face against your verified account…'}
        </p>
        <div className="inset row" style={{ gap: 8, alignItems: 'flex-start' }}>
          <ShieldCheck size={15} style={{ color: 'var(--teal-600)', flex: '0 0 auto', marginTop: 1 }} />
          <span className="tiny muted">
            In this prototype, Face ID signs in the verified student demo account. Facial data is
            never stored and is handled under the Data Privacy Act of 2012.
          </span>
        </div>
        <button className="btn soft block" style={{ marginTop: 12 }} onClick={() => setFaceOpen(false)}>
          Use password instead
        </button>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ register */

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [idAttached, setIdAttached] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeSeller, setAgreeSeller] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const emailValid = /^[a-z0-9._%+-]+@mcl\.edu\.ph$/i.test(email.trim());
  const passwordValid = password.length >= 8;

  const next = () => {
    setError('');
    if (!name.trim()) return setError('Enter your full name as it appears on your school ID.');
    if (!emailValid) return setError('Use a valid @mcl.edu.ph institutional email address.');
    if (!passwordValid) return setError('Your password must be at least 8 characters.');
    if (password !== confirm) return setError('The passwords do not match.');
    setStep(2);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreeTerms || !agreePrivacy) {
      return setError('Please agree to the Terms of Service and Privacy Policy to continue.');
    }
    setBusy(true);
    window.setTimeout(() => {
      const result = register({ name, email, password, role, department });
      setBusy(false);
      if (!result.ok) {
        setError(result.error ?? 'Unable to create your account.');
        setStep(1);
        return;
      }
      navigate('/pending');
    }, 450);
  };

  return (
    <div className="auth" style={{ paddingTop: 18 }}>
      <div className="auth-top">
        <button className="icon-btn light" onClick={() => (step === 2 ? setStep(1) : navigate('/'))} aria-label="Go back">
          <ChevronLeft size={19} />
        </button>
        <span className="auth-brand">
          <Wordmark light height={26} />
        </span>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
          Step {step}/2
        </span>
      </div>

      <div className="auth-hero" style={{ margin: '22px 0 16px' }}>
        <span className="eyebrow" style={{ color: '#f7ebc6' }}>
          Join the campus marketplace
        </span>
        <h1 style={{ fontSize: 29 }}>
          {step === 1 ? 'Create your account.' : 'Verify your campus.'}
        </h1>
        <p>
          {step === 1
            ? 'Only verified MMCL students and faculty can join. Registration is free.'
            : 'Your account is reviewed by the Student Affairs Office before marketplace access is granted.'}
        </p>
      </div>

      <form className="auth-card" onSubmit={submit}>
        {error && (
          <div className="form-alert error">
            <LockKeyhole size={14} style={{ marginTop: 1, flex: '0 0 auto' }} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="field">
              <label className="label" htmlFor="reg-name">
                Full name
              </label>
              <input
                id="reg-name"
                className="input"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-email">
                Institutional email
              </label>
              <div className="input-wrap">
                <span className="lead">
                  <Mail size={16} />
                </span>
                <input
                  id="reg-email"
                  className={`input ${email && !emailValid ? 'error' : ''}`}
                  placeholder="name@mcl.edu.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
              <span className="hint">
                Must be a valid <strong>@mcl.edu.ph</strong> address. Other .edu.ph schools will be
                supported as CampuSmart expands.
              </span>
            </div>

            <div className="field">
              <span className="label">I am a</span>
              <div className="segmented">
                <button
                  type="button"
                  className={role === 'student' ? 'active' : ''}
                  onClick={() => setRole('student')}
                >
                  <GraduationCap size={14} /> Student
                </button>
                <button
                  type="button"
                  className={role === 'faculty' ? 'active' : ''}
                  onClick={() => setRole('faculty')}
                >
                  <BookOpen size={14} /> Faculty
                </button>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-dept">
                Department
              </label>
              <div className="select-wrap">
                <select
                  id="reg-dept"
                  className="select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <ChevronLeft size={15} style={{ transform: 'translateY(-50%) rotate(-90deg)' }} />
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-pass">
                Password
              </label>
              <div className="input-wrap">
                <span className="lead">
                  <LockKeyhole size={16} />
                </span>
                <input
                  id="reg-pass"
                  className="input has-trail"
                  type={show ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <span className="trail">
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: 34, height: 34 }}
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="reg-confirm">
                Confirm password
              </label>
              <input
                id="reg-confirm"
                className="input"
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button className="btn primary block lg" type="button" onClick={next}>
              Continue <ArrowRight size={16} />
            </button>
            <p className="hint center" style={{ marginTop: 10 }}>
              Already registered?{' '}
              <button
                type="button"
                style={{ fontWeight: 700, color: 'var(--navy-600)' }}
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="inset" style={{ marginBottom: 14 }}>
              <div className="row" style={{ gap: 10 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'var(--gold-100)',
                    color: 'var(--gold-600)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <GraduationCap size={19} />
                </span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 750 }}>{name || 'Your name'}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 1 }}>
                    {email || 'name@mcl.edu.ph'} · {role === 'student' ? 'Student' : 'Faculty'}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`meetup-opt ${idAttached ? 'active' : ''}`}
              onClick={() => setIdAttached(true)}
              style={{ marginBottom: 14 }}
            >
              <span className="row" style={{ gap: 10, flex: 1 }}>
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: idAttached ? 'var(--success-soft)' : 'var(--bg)',
                    color: idAttached ? 'var(--success)' : 'var(--muted)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {idAttached ? <Check size={18} /> : <Camera size={18} />}
                </span>
                <span>
                  <span className="name">{idAttached ? 'School ID attached' : 'Attach school ID'}</span>
                  <span className="detail">
                    {idAttached
                      ? 'school-id.jpg · deleted after verification'
                      : 'For identity review · optional in demo'}
                  </span>
                </span>
              </span>
              <span className="badge gray">{idAttached ? 'Ready' : 'Upload'}</span>
            </button>

            <div className="form-alert info">
              <Clock3 size={15} style={{ marginTop: 1, flex: '0 0 auto' }} />
              <span>
                Verification may take up to <strong>24 hours</strong>. Your account stays pending and
                marketplace access is restricted until an administrator approves it.
              </span>
            </div>

            <div className="col" style={{ gap: 12, marginBottom: 16 }}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span>
                  I agree to the <Link to="/policies/terms">Terms & Conditions</Link>, including the
                  rules for buying, selling, renting, and borrowing.
                </span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                <span>
                  I consent to the processing of my information under the{' '}
                  <Link to="/policies/privacy">Privacy Policy</Link> (RA 10173).
                </span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={agreeSeller}
                  onChange={(e) => setAgreeSeller(e.target.checked)}
                />
                <span>
                  I will follow the <Link to="/policies/seller">Seller Policies</Link> and will not
                  list prohibited items.
                </span>
              </label>
            </div>

            <button className="btn gold block lg" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit for verification'}
            </button>
            <button
              type="button"
              className="btn soft block"
              style={{ marginTop: 8 }}
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </>
        )}
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ pending */

export function PendingScreen() {
  const navigate = useNavigate();
  const { state, pendingUserId, approveAndLogin } = useApp();
  const { toast } = useToast();
  const user = state.users.find((u) => u.id === pendingUserId) ?? state.users.find((u) => u.status === 'pending');

  const approveDemo = () => {
    if (!user) return;
    approveAndLogin(user.id);
    toast('Account approved. Welcome to CampuSmart!', 'success');
    navigate('/home');
  };

  return (
    <div className="pending">
      <div className="pending-icon">
        <ShieldCheck size={38} strokeWidth={1.8} />
      </div>
      <div className="center">
        <span className="badge gold" style={{ marginBottom: 10 }}>
          <Clock3 size={11} /> Pending verification
        </span>
        <h1 className="h1" style={{ fontSize: 26 }}>
          We're reviewing your account.
        </h1>
        <p className="small muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
          {user ? (
            <>
              <strong style={{ color: 'var(--ink)' }}>{user.email}</strong> was submitted for
              review. An administrator will confirm your campus affiliation within 24 hours.
            </>
          ) : (
            'Your registration was submitted. An administrator will confirm your campus affiliation within 24 hours.'
          )}
        </p>
      </div>

      <div className="card pad" style={{ marginTop: 20 }}>
        <div className="timeline">
          <div className="tl-item done">
            <span className="tl-dot">
              <Check size={11} />
            </span>
            <div>
              <div className="t">Registration submitted</div>
              <div className="d">Your institutional email and details were received.</div>
            </div>
          </div>
          <div className="tl-item current">
            <span className="tl-dot">
              <Clock3 size={11} />
            </span>
            <div>
              <div className="t">Administrator review</div>
              <div className="d">Student Affairs checks your campus affiliation. Up to 24 hours.</div>
            </div>
          </div>
          <div className="tl-item">
            <span className="tl-dot">3</span>
            <div>
              <div className="t">Marketplace access</div>
              <div className="d">Once approved, you can buy, sell, rent, and borrow.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-alert info" style={{ marginTop: 16 }}>
        <BadgeCheck size={15} style={{ marginTop: 1, flex: '0 0 auto' }} />
        <span>
          Access to listings, messaging, and orders stays restricted while your account is pending.
          This keeps the marketplace limited to verified MMCL members.
        </span>
      </div>

      <button className="btn primary block lg" onClick={approveDemo} disabled={!user}>
        <Sparkles size={17} /> Simulate admin approval (demo)
      </button>
      <button
        className="btn soft block"
        style={{ marginTop: 8 }}
        onClick={() => navigate('/login')}
      >
        Back to sign in
      </button>
      <p className="hint center" style={{ marginTop: 12 }}>
        Need help? Visit the Student Affairs Office (SOA) or email support@campussmart.ph.
      </p>
    </div>
  );
}
