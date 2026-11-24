'use client';

import { useEffect } from 'react';
import { Notification } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CafeIcon } from '@/shared/ui/cafe-icon';
import classes from './study-rooms.module.css';

const autoCloseMs = 4000;

/** Short confirmation after a change; the live region stays mounted so screen readers announce it. */
export function FeedbackToast({ message, onClose }: { message: { id: number; text: string } | null; onClose: () => void }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div role="status" aria-live="polite" className={classes.toast}>
      {message && (
        <Notification key={message.id} role="presentation" icon={<CafeIcon name="info" size={20} />} classNames={{ icon: classes.toastIcon }} withBorder onClose={onClose} closeButtonProps={{ 'aria-label': t('studyRooms.dismiss') }}>
          {message.text}
        </Notification>
      )}
    </div>
  );
}
