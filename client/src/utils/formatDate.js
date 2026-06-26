export function formatRelativeTime(isoString){
  if (!isoString) return '';
  const d = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  const min = Math.floor(diff/60);
  if (min < 60) return `${min} minutes ago`;
  const hrs = Math.floor(min/60);
  if (hrs < 24) return hrs === 1 ? 'an hour ago' : `${hrs} hours ago`;
  const days = Math.floor(hrs/24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toDateString();
}

export function formatDueDate(isoString){
  if (!isoString) return '';
  const d = new Date(isoString);
  const opts = { weekday:'short', month:'short', day:'numeric' };
  const datePart = d.toLocaleDateString(undefined, opts);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mins = minutes.toString().padStart(2,'0');
  return `${datePart}, ${hours}:${mins} ${ampm}`;
}
