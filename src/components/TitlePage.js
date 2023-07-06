import React from 'react'

export default function TitlePage() {
  return (
    <>
      <div className='title-page'>
        <div>
          <h1>Learn Kana!</h1>
          <h3>By Eldoprano</h3>
        </div>
        <a className='glowButton' onClick={() => window.location.href = '#game-menu-title'}>Start practicing!</a>
      </div>
    </>
  )
}
