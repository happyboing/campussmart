import { useState } from 'react';
import { Star } from 'lucide-react';
import { useApp } from '../store';
import { Sheet, useToast } from './ui';

export function RatingSheet({
  open,
  onClose,
  orderId,
  sellerName,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  sellerName: string;
}) {
  const { rateOrder } = useApp();
  const { toast } = useToast();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  const submit = () => {
    rateOrder(orderId, stars, comment.trim());
    toast(`Thanks! You rated ${sellerName} ${stars} star${stars > 1 ? 's' : ''}.`, 'success');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Rate ${sellerName.split(' ')[0]}`}
      subtitle="Your feedback helps the campus community trade with confidence."
    >
      <div className="rate-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={n <= stars ? 'on' : ''}
            onClick={() => setStars(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            <Star size={31} />
          </button>
        ))}
      </div>
      <p className="center small bold" style={{ marginBottom: 14 }}>
        {stars === 5
          ? 'Excellent experience'
          : stars === 4
            ? 'Good experience'
            : stars === 3
              ? 'It was okay'
              : stars === 2
                ? 'Needs improvement'
                : 'Poor experience'}
      </p>
      <div className="field">
        <label className="label" htmlFor="rate-comment">
          Comment <span className="opt">optional</span>
        </label>
        <textarea
          id="rate-comment"
          className="textarea"
          placeholder="How was the item and the meetup?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <button className="btn gold block lg" onClick={submit}>
        Submit rating
      </button>
      <button className="btn ghost block" style={{ marginTop: 4 }} onClick={onClose}>
        Not now
      </button>
    </Sheet>
  );
}
