export default function detectIntent(text = '') {
  const lowerText = text.toLowerCase()

  if (/remind|don't forget|dont forget|alert me|notify me|schedule/.test(lowerText)) {
    return 'reminder'
  }

  if (/todo|to-do|to do|need to|must|should|complete|finish/.test(lowerText)) {
    return 'task'
  }

  return 'note'
}
