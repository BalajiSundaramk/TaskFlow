export default function detectIntent(text = '') {
  const lowerText = text.toLowerCase()

  if (/remind|reminder|don't forget|dont forget|alert me|notify me|schedule|alarm/.test(lowerText)) {
    return 'reminder'
  }

  if (/todo|to-do|to do|need to|must|should|complete|finish|do this|task|buy|call|fix|send|submit|review|check/.test(lowerText)) {
    return 'task'
  }

  return 'note'
}
