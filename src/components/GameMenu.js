import React from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'



export default function GameMenu() {
  return (
    <div className='game-menu-page'>
      <h2 id='game-menu-title'>Select a group to learn</h2>
      <div className='kana-group-selector'>
        <KanaGroup groupToShow="hiragana" />
        <div className='kana-divider'></div>
        <KanaGroup groupToShow="katakana" />
      </div>
      <div className='game-mode-selector'>
        <GameModeSelector />
      </div>
      <button>Let's start!</button>
    </div>
  )
}
