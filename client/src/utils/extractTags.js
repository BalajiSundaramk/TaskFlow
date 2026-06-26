const KEYWORDS = ['work','personal','urgent','health','finance','shopping','meeting','call','email','project'];

export default function extractTags(text = ''){
  const lower = text.toLowerCase();
  const tagSet = new Set();
  // hashtags
  const hashRe = /#([a-z0-9_-]+)/gi;
  let m;
  while ((m = hashRe.exec(text)) !== null) tagSet.add(m[1].toLowerCase());
  // keywords
  for (const k of KEYWORDS) if (new RegExp(`\\b${k}\\b`).test(lower)) tagSet.add(k);
  return Array.from(tagSet);
}
