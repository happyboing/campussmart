import { useState } from 'react';
import { Check, MessageSquareHeart, Star } from 'lucide-react';
import { Sheet, useToast } from './ui';

const EASE = [
  { id: 'easy', label: 'Very easy' },
  { id: 'okay', label: 'Somewhat easy' },
  { id: 'hard', label: 'Needs work' },
];

export function FeedbackSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [stars, setStars] = useState(5);
  const [ease, setEase] = useState('easy');
  const [recommend, setRecommend] = useState(true);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    try {
      const key = 'campussmart.feedback.v1';
      const existing = JSON.parse(localStorage.getItem(key) ?? '[]');
      existing.push({
        stars,
        ease,
        recommend,
        comment: comment.trim(),
        at: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {
      // Feedback is best-effort in the prototype.
    }
    setSent(true);
    toast('Thank you! Your feedback was recorded for the prototype evaluation.', 'success');
  };

  const close = () => {
    setSent(false);
    setComment('');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Share prototype feedback"
      subtitle="Help the team evaluate usability and effectiveness (Part 6.7 / 9.3 of the proposal)."
    >
      {sent ? (
        <div className="empty" style={{ paddingTop: 12 }}>
          <div className="art">
            <Check size={30} />
          </div>
          <h3>Feedback recorded</h3>
          <p>
            Salamat! Your responses help the CampuSmart team improve the campus marketplace each
            term using the Plan–Do–Check–Act cycle.
          </p>
          <button className="btn primary sm" style={{ marginTop: 8 }} onClick={close}>
            Done
          </button>
        </div>
      ) : (
        <>
          <div className="inset" style={{ marginBottom: 14 }}>
            <div className="row" style={{ gap: 8 }}>
              <MessageSquareHeart size={17} style={{ color: 'var(--gold-600)' }} />
              <span className="tiny" style={{ lineHeight: 1.5 }}>
                A short in-app survey, as described in the TQM plan. Responses stay on this device
                in the prototype.
              </span>
            </div>
          </div>

          <div className="field">
            <span className="label">Overall experience</span>
            <div className="rate-stars" style={{ justifyContent: 'flex-start', padding: '2px 0' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={n <= stars ? 'on' : ''}
                  onClick={() => setStars(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Star size={28} />
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="label">How easy was it to complete your task?</span>
            <div className="row wrap" style={{ gap: 6 }}>
              {EASE.map((e) => (
                <button
                  key={e.id}
                  className={`chip ${ease === e.id ? 'active' : ''}`}
                  onClick={() => setEase(e.id)}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <label className="check" style={{ marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={recommend}
              onChange={(e) => setRecommend(e.target.checked)}
            />
            <span>I would recommend CampuSmart to a classmate or faculty member.</span>
          </label>

          <div className="field">
            <label className="label" htmlFor="feedback-comment">
              What should we improve? <span className="opt">optional</span>
            </label>
            <textarea
              id="feedback-comment"
              className="textarea"
              style={{ minHeight: 84 }}
              placeholder="Tell us what felt confusing, slow, or missing…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button className="btn gold block lg" onClick={submit}>
            Submit feedback
          </button>
          <button className="btn ghost block" style={{ marginTop: 4 }} onClick={close}>
            Not now
          </button>
        </>
      )}
    </Sheet>
  );
}
