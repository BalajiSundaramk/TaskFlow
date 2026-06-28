import React from 'react';

export default function highlightText(text = '', query = '') {
  if (!query) return text;
  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'i');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return parts.map((part, index) => {
    return regex.test(part) ? (
      <span key={index} style={{ background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 3, padding: '0 2px' }}>
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  })
}
