const KEYWORDS = ['work', 'personal', 'urgent', 'health', 'finance', 'shopping', 'meeting', 'call', 'email', 'project', 'home', 'family', 'fitness', 'travel', 'learning', 'career']

export default function extractTags(text = '') {
  const lowerText = text.toLowerCase()
  const tagSet = new Set()

  const hashRegex = /#(\w+)/gi
  let match
  while ((match = hashRegex.exec(text)) !== null) {
    tagSet.add(match[1].toLowerCase())
  }

  for (const keyword of KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, 'i').test(lowerText)) {
      tagSet.add(keyword)
    }
  }

  return Array.from(tagSet)
}
