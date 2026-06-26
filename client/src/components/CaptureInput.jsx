import React, { useState, useRef, useEffect } from 'react'
import detectIntent from '../utils/detectIntent'

export default function CaptureInput({ onSubmit }){
  const [text, setText] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(()=>{
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new Rec()
    r.lang = 'en-US'
    r.interimResults = false
    r.onresult = (e) => { setText(t => t + ' ' + e.results[0][0].transcript) }
    r.onend = ()=> setListening(false)
    recognitionRef.current = r
  },[])

  const handleKeyDown = (e)=>{
    if (e.key === 'Enter' && !e.shiftKey){
      e.preventDefault(); submit();
    }
  }

  const submit = async ()=>{
    if (!text.trim()) return;
    try {
      await onSubmit(text.trim())
      setText('')
    } catch (err) { console.error(err) }
  }

  const toggleMic = ()=>{
    const r = recognitionRef.current
    if (!r) return alert('Speech API not supported in this browser')
    if (listening){ r.stop(); setListening(false) }
    else { r.start(); setListening(true) }
  }

  const type = detectIntent(text)

  return (
    <div style={{marginBottom:8}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <span className={`badge ${type}`}>{type}</span>
        <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKeyDown} rows={3} style={{flex:1,padding:8,borderRadius:8}} placeholder="Capture a thought, todo, or reminder..." />
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <button className="btn" onClick={submit}>Submit</button>
          <button className="btn" onClick={toggleMic}>{listening ? 'Stop' : '🎤'}</button>
        </div>
      </div>
    </div>
  )
}
