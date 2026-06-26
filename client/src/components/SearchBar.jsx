import React from 'react'

export default function SearchBar({ onSearch }){
  return (
    <div style={{margin:'8px 0'}}>
      <input placeholder="Search..." onChange={e=>onSearch(e.target.value)} style={{width:'100%',padding:8,borderRadius:8}} />
    </div>
  )
}
