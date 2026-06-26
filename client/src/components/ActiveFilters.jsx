import React from 'react'

export default function ActiveFilters({ filters, onRemove }){
  if (!filters) return null
  return (
    <div style={{display:'flex',gap:8,alignItems:'center',margin:'8px 0'}}>
      {filters.type && <div className="tag">{filters.type} <button style={{marginLeft:6}} onClick={()=>onRemove('type',filters.type)}>×</button></div>}
      {filters.tags && filters.tags.map(t=> <div key={t} className="tag">{t} <button style={{marginLeft:6}} onClick={()=>onRemove('tag',t)}>×</button></div>)}
    </div>
  )
}
