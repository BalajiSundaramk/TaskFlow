import React, { useEffect, useRef, useState } from 'react'
import detectIntent from '../utils/detectIntent'

export default function CaptureInput({ onCapture }) {
  const [text, setText] = useState('')
  const [detectedType, setDetectedType] = useState('note')
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
      setText((current) => (current ? `${current} ${transcript}` : transcript))
      setDetectedType(detectIntent(transcript))
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

  const handleChange = (event) => {
    const value = event.target.value
    setText(value)
    setDetectedType(detectIntent(value))
  }

  const handleSubmit = () => {
    if (!text.trim()) return
    onCapture(text)
    setText('')
    setDetectedType('note')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    recognitionRef.current.start()
    setIsListening(true)
  }

  const supportsVoice = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  return (
    <div className="capture-card">
      <textarea
        className="capture-input"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Capture a task, note, or reminder..."
      />
      <div className="capture-toolbar">
        <div className="capture-actions">
          <span className={`type-badge ${detectedType}`}>
            Detected: {detectedType.charAt(0).toUpperCase() + detectedType.slice(1)}
          </span>
          {supportsVoice && (
            <button type="button" className={`voice-button ${isListening ? 'listening' : ''}`} onClick={toggleVoice}>
              <span className="voice-dot" />
              {isListening ? 'Listening' : 'Voice'}
            </button>
          )}
        </div>
        <button type="button" className="submit-button" onClick={handleSubmit}>
          Capture
        </button>
      </div>
    </div>
  )
}
