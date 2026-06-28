import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { format, formatDistanceToNowStrict } from 'date-fns'
import detectIntent from '../utils/detectIntent'
import extractTags from '../utils/extractTags'

const promptChips = [
  { label: '📋 Add a task', value: 'todo: finish the budget review' },
  { label: '🔔 Set a reminder', value: 'remind me to call Anna tomorrow at 9am' },
  { label: '📝 Save a note', value: 'note: project kickoff went great #work' }
]

const parseReminderDate = (text) => {
  const explicitDate = new Date(text)
  if (!Number.isNaN(explicitDate.getTime()) && explicitDate > new Date()) {
    return explicitDate
  }

  if (/tomorrow/i.test(text)) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i)
    if (timeMatch) {
      let hour = Number(timeMatch[1])
      const minutes = Number(timeMatch[2] || '0')
      const period = timeMatch[3].toLowerCase()
      if (period === 'pm' && hour < 12) hour += 12
      if (period === 'am' && hour === 12) hour = 0
      tomorrow.setHours(hour, minutes, 0, 0)
    }
    return tomorrow
  }

  return null
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'h:mm a')
}

const getBotReply = (text, type, tags, date) => {
  if (text.includes('?')) {
    return "That's a great thought to note down. I've saved it for you — check the Notes page to revisit it later."
  }

  if (type === 'task') {
    return "Got it! I've saved that as a task. ✦ I'll keep it in your task list so you don't forget."
  }

  if (type === 'reminder') {
    if (date) {
      return `Reminder set! ◎ I'll alert you on ${format(date, 'MMM d, yyyy h:mm a')}. Make sure notifications are enabled in your browser.`
    }
    return "Saved as a reminder ◎ — I didn't catch a specific time though. You can check it in your Reminders page."
  }

  return `Note captured ◆ Tagged: ${tags.length > 0 ? tags.map((tag) => `#${tag}`).join(' ') : 'none'}. You can find it anytime in your Notes page.`
}

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items')
        const existing = response.data.map((item) => ({
          id: `loaded-${item.id}`,
          role: 'user',
          content: item.content,
          timestamp: item.created_at || new Date().toISOString()
        }))
        setMessages(existing)
      } catch (err) {
        setError('Unable to load chat history')
      }
    }

    fetchItems()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      setInput((prev) => `${prev} ${transcript}`.trim())
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      setError(event?.error === 'not-allowed' ? 'Microphone access denied.' : 'Voice recognition failed. Please try again.')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      setIsListening(false)
      setError('Unable to start voice recognition.')
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const text = input.trim()
    const type = detectIntent(text)
    const tags = extractTags(text)
    const reminderDate = parseReminderDate(text)
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError('')

    const typingTimer = window.setTimeout(() => setIsTyping(true), 300)

    try {
      await axios.post('/api/items', {
        content: text,
        type,
        tags: JSON.stringify(tags),
        remind_at: null
      })

      window.setTimeout(() => {
        clearTimeout(typingTimer)
        setIsTyping(false)
        const botMessage = {
          id: `bot-${Date.now()}`,
          role: 'bot',
          content: getBotReply(text, type, tags, reminderDate),
          timestamp: new Date().toISOString()
        }
        setMessages((prev) => [...prev, botMessage])
      }, 600)
    } catch (err) {
      clearTimeout(typingTimer)
      setIsTyping(false)
      setError('Unable to send message')
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-avatar">⚡</div>
        <div>
          <div className="chat-title">TaskFlow Assistant</div>
          <div className="chat-subtitle">Always here to capture your thoughts</div>
        </div>
        <div className="online-indicator">
          <span className="online-dot" />
          Online
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !isTyping ? (
          <div className="chat-empty">
            <div className="chat-empty-title">Start a conversation with TaskFlow</div>
            <div className="chat-chips">
              {promptChips.map((chip) => (
                <button key={chip.label} type="button" className="chat-chip" onClick={() => setInput(chip.value)}>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`chat-bubble-row ${message.role === 'user' ? 'user' : 'bot'}`}>
              {message.role === 'bot' && <div className="chat-avatar-sm">⚡</div>}
              <div className={`chat-bubble ${message.role === 'user' ? 'user' : 'bot'}`}>
                <div>{message.content}</div>
                <div className={`chat-meta ${message.role === 'user' ? 'user' : 'bot'}`}>
                  {message.role === 'user' ? formatTime(message.timestamp) : 'TaskFlow'}
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping ? (
          <div className="chat-bubble-row bot">
            <div className="chat-avatar-sm">⚡</div>
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <button type="button" className="chat-mic-btn" onClick={handleVoice}>
          🎤
        </button>
        <textarea
          className="chat-textarea"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your note, task, or reminder..."
          rows={1}
        />
        <button
          type="button"
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          →
        </button>
      </div>

      {error ? <div className="chat-error">{error}</div> : null}
    </div>
  )
}
