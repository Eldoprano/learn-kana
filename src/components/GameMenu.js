import React from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import { Outlet, Link } from "react-router-dom";

export default function GameMenu() {

  if(localStorage.getItem('checkedKanas') === null) {
    localStorage.setItem('checkedKanas', ['あ'])
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
      <h2 id='game-menu-title'>Select a group to learn</h2>
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
    </div>
  )
}
