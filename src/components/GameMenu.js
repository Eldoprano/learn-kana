import React, { useState } from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import ProgressStatsModal from './ProgressStatsModal'
import { Link } from "react-router-dom";

export default function GameMenu() {
  const [showStatsModal, setShowStatsModal] = useState(false);

  if(localStorage.getItem('checkedKanas') === null) {
    localStorage.setItem('checkedKanas', JSON.stringify(["あ"]))
  }

  const handleButtonClick = () => {
    const checkboxes = document.querySelectorAll('.kana-checkbox');
    const checkedChars = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedChars.push(checkbox.id);
      }
    });

    // Save result to local storage
    localStorage.setItem('checkedKanas', JSON.stringify(checkedChars));

  };

  return (
    <div className='game-menu-page'>
      <div className='game-menu-header'>
        <h2 id='game-menu-title'>Select a group to learn</h2>
        <button className='neoButton stats-button' onClick={() => setShowStatsModal(true)} title='View Progress Stats'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-6h2v16h-2V5z"/>
          </svg>
        </button>
      </div>
      <div className='kana-group-selector'>
        <KanaGroup groupToShow="hiragana" />
        <KanaGroup groupToShow="katakana" />
      </div>
      <div className='game-mode-selector'>
        <GameModeSelector />
        <Link to='/learn-kana∕game'>
          <button className='glowButton' onClick={handleButtonClick}>Let's start!</button>
        </Link>
      </div>
      <ProgressStatsModal visible={showStatsModal} onClose={() => setShowStatsModal(false)} />
    </div>
  )
}
