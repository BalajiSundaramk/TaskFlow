import React from 'react';

export default function ReminderPopup({ reminder, onSnooze, onComplete, onClose }) {
  if (!reminder) return null;

  const handleSnooze = (minutes) => {
    onSnooze(reminder.id, minutes);
    onClose();
  };

  return (
    <div className="reminder-popup-overlay" onClick={onClose}>
      <div className="reminder-popup" onClick={(event) => event.stopPropagation()}>
        <div className="popup-icon">⏰</div>
        <div className="popup-title">Reminder Due!</div>
        <div className="popup-content">{reminder.content}</div>
        <div className="popup-actions">
          <button className="snooze-btn" onClick={() => handleSnooze(10)}>Snooze 10 min</button>
          <button className="snooze-btn" onClick={() => handleSnooze(30)}>Snooze 30 min</button>
          <button className="popup-done-btn" onClick={() => { onComplete(reminder.id); onClose(); }}>Mark Done</button>
        </div>
      </div>
    </div>
  );
}
