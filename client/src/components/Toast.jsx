import React, { useEffect } from 'react'

export default function Toast({ message, type='success' }){
  useEffect(()=>{
    const t = setTimeout(()=>{},3000)
    return ()=>clearTimeout(t)
  },[message])
  return <div className={`toast ${type}`}>{message}</div>
}
