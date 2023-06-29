import React from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import { Outlet, Link } from "react-router-dom";


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
        <Link to='/learn-kana/game'>
        <button className='glowButton'>Let's start!</button>
        </Link>
      </div>
    </div>
  )
}
