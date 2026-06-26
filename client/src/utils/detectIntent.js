export default function detectIntent(text = '') {
  const s = text.toLowerCase();
  if (/remind|don't forget|dont forget|alert me|notify me|schedule/.test(s)) return 'reminder';
  if (/todo|to do|need to|must|should|complete|finish/.test(s)) return 'task';
  return 'note';
}
