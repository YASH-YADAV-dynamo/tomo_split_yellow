'use client';

import { useMemo, useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useSettlements } from '@/hooks/useSettlements';

interface SettleDuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettleDuesModal({ isOpen, onClose }: SettleDuesModalProps) {
  const { dues, total, loading, settleSelected, message } = useSettlements();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const selectedTotal = useMemo(() => {
    return dues
      .filter((d) => selected[d.splitId])
      .reduce((acc, d) => acc + (typeof d.amount === 'number' ? d.amount : parseFloat(String(d.amount) || '0')), 0);
  }, [dues, selected]);

  const toggle = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSettle = async () => {
    try {
      setSubmitting(true);
      await settleSelected(selectedIds);
      setSelected({});
      onClose();
    } catch (e) {
      alert((e as Error).message || 'Failed to settle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settle Pending Dues" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You will sign the following message to confirm settlement:
        </p>
        <pre className="text-xs p-3 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 overflow-x-auto">{message}</pre>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {loading ? (
            <p className="text-sm">Loading dues...</p>
          ) : dues.length === 0 ? (
            <p className="text-sm">No pending dues. You're all settled!</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto pr-2">
              {dues.map((d) => (
                <label key={d.splitId} className="flex items-center justify-between p-3 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={!!selected[d.splitId]}
                      onChange={() => toggle(d.splitId)}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{d.expenseTitle}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Group: {d.groupName} • Owed to: {d.owedToUserName}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">${(typeof d.amount === 'number' ? d.amount : parseFloat(String(d.amount) || '0')).toFixed(2)}</div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Selected: ${selectedTotal.toFixed(2)} / Total Pending: ${total.toFixed(2)}
          </div>
          <div className="space-x-2">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSettle} disabled={submitting || selectedIds.length === 0}>
              {submitting ? 'Signing…' : 'Sign & Settle'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}


