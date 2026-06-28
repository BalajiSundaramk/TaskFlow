import React, { useEffect, useMemo, useRef, useState } from 'react'
import detectIntent from '../utils/detectIntent'

const placeholders = [
  'Try: remind me to call John tomorrow at 3pm',
  'Try: todo: finish the report by Friday',
  'Try: note: meeting went well today #work'
]

export default function CaptureInput({ onCapture }) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const activeRecognitionRef = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      activeRecognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % placeholders.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const detectedType = useMemo(() => detectIntent(text), [text])

  const clearVoiceError = () => {
    window.setTimeout(() => {
      if (isMountedRef.current) {
        setVoiceError('')
      }
    }, 3000)
  }

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
      setVoiceError('Speech recognition not supported in this browser.')
      clearVoiceError()
      return
    }

    if (isListening) {
      activeRecognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      if (isMountedRef.current) {
        setIsListening(true)
        setVoiceError('')
      }
    }

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      if (transcript) {
        setText((prev) => `${prev} ${transcript}`.trim())
      }
      if (isMountedRef.current) {
        setIsListening(false)
      }
    }

    recognition.onerror = (event) => {
      if (isMountedRef.current) {
        setIsListening(false)
        const message = event?.error === 'not-allowed'
          ? 'Microphone access denied. Please allow access and try again.'
          : event?.error === 'no-speech'
          ? 'No speech detected. Try again and speak clearly.'
          : 'Voice recognition failed. Please try again.'
        setVoiceError(message)
        clearVoiceError()
      }
    }

    recognition.onend = () => {
      if (isMountedRef.current) {
        setIsListening(false)
      }
    }

    activeRecognitionRef.current = recognition

    try {
      recognition.start()
    } catch (error) {
      setIsListening(false)
      setVoiceError('Unable to start voice recognition.')
      clearVoiceError()
    }
  }

  const placeholder = text.trim() ? '' : placeholders[placeholderIndex]
  const showVoice = Boolean(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition))

  return (
    <div className="capture-card">
      <div className="capture-label">
        <span>Quick Capture</span>
        <span className={`type-badge ${detectedType}`}>Detected: {detectedType === 'task' ? 'Task ✦' : detectedType === 'reminder' ? 'Reminder ◎' : 'Note ◆'}</span>
      </div>
      <textarea
        className="capture-textarea"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={4}
      />
      <div className="capture-footer-row">
        <div className="capture-meta">
          <span>{text.length} characters</span>
          {voiceError ? <span className="voice-error">{voiceError}</span> : null}
        </div>
        <div className="capture-actions">
          {showVoice ? (
            <button className={`voice-btn ${isListening ? 'listening' : ''}`} type="button" onClick={handleVoice}>
              {isListening ? <span className="voice-dot" /> : '🎤'}
              {isListening ? 'Listening...' : 'Voice'}
            </button>
          ) : null}
          <button className="capture-btn" type="button" onClick={handleSubmit} disabled={!text.trim()}>
            Capture
          </button>
        </div>
      </div>
    </div>
  )
}
