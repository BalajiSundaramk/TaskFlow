import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import detectIntent from '../utils/detectIntent'
import extractTags from '../utils/extractTags'
import { formatDueDate } from '../utils/formatDate'

const defaultPrompts = [
  'remind me to call Anna tomorrow at 9am',
  'todo: submit the budget review',
  'note: project kickoff went great #work'
]

export default function ChatPage() {
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    const fetchItems = async () => {
      const response = await axios.get('/api/items')
      setItems(response.data)
      setMessages(response.data.map((item) => ({ id: `loaded-${item.id}`, type: 'user', content: item.content })))
    }
    fetchItems()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      setInput((prev) => `${prev} ${transcript}`.trim())
      setIsListening(false)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return
    const text = input.trim()
    const type = detectIntent(text)
    const tags = extractTags(text)
    const createdUserMessage = { id: `user-${Date.now()}`, type: 'user', content: text }
    setMessages((prev) => [...prev, createdUserMessage])
    setInput('')

    try {
      await axios.post('/api/items', { content: text, type, tags: JSON.stringify(tags), remind_at: null })
      setTimeout(() => {
        const lines = [`Got it! Captured as a ${type} 📋`]
        if (tags.length) lines.push(`Tagged: ${tags.map((tag) => `#${tag}`).join(' ')}`)
        if (type === 'reminder') {
          const parsedDate = new Date(text)
          const reminderText = tags.length ? `⏰ I'll remind you on ${formatDueDate(parsedDate.toISOString())}` : '⏰ Reminder saved.'
          lines.push(reminderText)
        }
        setMessages((prev) => [...prev, { id: `system-${Date.now()}`, type: 'system', content: lines.join('\n') }])
      }, 500)
    } catch (err) {
      setError('Unable to capture message')
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice not supported')
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
    <div className="chat-page">
      <div className="chat-header">
        <h2>Chat with TaskFlow</h2>
        <p>Capture quickly with chat-style messaging.</p>
      </div>

      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-title">Start capturing your thoughts...</div>
            <div className="prompt-chips">
              {defaultPrompts.map((prompt) => (
                <button key={prompt} type="button" className="prompt-chip" onClick={() => setInput(prompt)}>{prompt}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`chat-bubble ${message.type === 'user' ? 'chat-user' : 'chat-system'}`}>
              <pre>{message.content}</pre>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your note, task, or reminder..." />
        <div className="chat-input-actions">
          <button className="voice-btn" type="button" onClick={handleVoice}>{isListening ? 'Listening…' : '🎤'}</button>
          <button className="capture-btn" type="button" onClick={handleSend} disabled={!input.trim()}>Send</button>
        </div>
      </div>
    </div>
  )
}
