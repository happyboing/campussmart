import { useState } from 'react';
import { AlertTriangle, Flag } from 'lucide-react';
import { REPORT_REASONS } from '../data/catalog';
import { useApp } from '../store';
import { Sheet, useToast } from './ui';

export function ReportSheet({
  open,
  onClose,
  listingId,
  targetUserId,
  targetName,
}: {
  open: boolean;
  onClose: () => void;
  listingId?: string;
  targetUserId?: string;
  targetName?: string;
}) {
  const { reportContent } = useApp();
  const { toast } = useToast();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');

  const submit = () => {
    if (details.trim().length < 10) {
      toast('Please describe the issue in at least 10 characters.', 'error');
      return;
    }
    reportContent({ listingId, targetUserId, reason, details: details.trim() });
    toast('Report submitted. The moderation team will review it.', 'success');
    setDetails('');
    setReason(REPORT_REASONS[0]);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Report a concern"
      subtitle={
        targetName
          ? `Reporting ${targetName}. Reports are confidential.`
          : 'Help keep the campus marketplace safe.'
      }
    >
      <div className="form-alert info">
        <AlertTriangle size={15} style={{ marginTop: 1, flex: '0 0 auto' }} />
        <span>
          Administrators review reports and may remove listings or restrict accounts. False or
          abusive reports may also be actioned.
        </span>
      </div>

      <div className="field">
        <label className="label" htmlFor="report-reason">
          What's the issue?
        </label>
        <div className="select-wrap">
          <select
            id="report-reason"
            className="select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REPORT_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="report-details">
          Details
        </label>
        <textarea
          id="report-details"
          className="textarea"
          placeholder="Describe what happened, including dates or messages if helpful…"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <span className="hint">Do not include passwords or one-time PINs.</span>
      </div>

      <button className="btn danger block" onClick={submit}>
        <Flag size={15} /> Submit report
      </button>
      <button className="btn ghost block" style={{ marginTop: 4 }} onClick={onClose}>
        Cancel
      </button>
    </Sheet>
  );
}
