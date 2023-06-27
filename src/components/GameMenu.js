import React from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'



export default function GameMenu() {
  return (
    <div>
      <h2>Selecta group to learn</h2>
      <div className='kana-group-selector'>
        <KanaGroup groupToShow="hiragana" />
        <KanaGroup groupToShow="katakana" />
      </div>
      <div className='game-mode-selector'>
        <GameModeSelector />
      </div>
      <button>Let's start!</button>
    </div>
  )
}
