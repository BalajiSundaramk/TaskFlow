import React, { useEffect, useRef, useState } from 'react'
import detectIntent from '../utils/detectIntent'

export default function CaptureInput({ onCapture }) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return undefined

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
      setText(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [])

  const detectedType = detectIntent(text)

  const handleSubmit = () => {
    if (!text.trim()) return
    onCapture(text.trim())
    setText('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    recognitionRef.current?.start()
    setIsListening(true)
  }

  return (
    <div className="capture-card">
      <div className="capture-label">
        <span>Quick Capture</span>
        {text.length > 0 && <span className={`type-badge ${detectedType}`}>{detectedType}</span>}
      </div>
      <textarea
        className="capture-textarea"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a task, note, or reminder... (Enter to capture)"
      />
      <div className="capture-divider" />
      <div className="capture-footer">
        <div className="capture-actions">
          <button className={`voice-btn ${isListening ? 'listening' : ''}`} type="button" onClick={handleVoice}>
            <span className="voice-dot" />
            {isListening ? 'Listening' : 'Voice'}
          </button>
        </div>
        <button className="capture-btn" type="button" onClick={handleSubmit} disabled={!text.trim()}>
          Capture
        </button>
      </div>
    </div>
  )
}
