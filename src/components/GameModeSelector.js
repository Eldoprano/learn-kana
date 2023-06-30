import React from 'react'
import ButtonWithArrows from './ButtonWithArrows'

export default function GameModeSelector() {

  const handleCheckMarked = (e) => {
    // Mark the checkbox as checked
    localStorage.setItem("gameMode", JSON.stringify(
      {
        "type": "kana-selector",
        "value": -1
      }
    ));
  }

  const handleLabelMarked = (e) => {
    // Mark the checkbox as checked
    localStorage.setItem("gameMode", JSON.stringify(
      {
        "type": "time-selector",
        "value": -1
      }
    ));
  }

  return (
    <div className='game-mode-selector-group'>
        <h2>Select a mode:</h2>
        <div className='game-mode-selector-button-group'>
          <ButtonWithArrows description="Give me" unit="Kanas" id="kana-selector"/>
          <div className='button-with-arrows'>
            <label data-gamemode="kana-selector">
              <input type="radio" 
                onClick={handleCheckMarked} 
                name="button-with-arrows-group" 
                id='time-selector-unlimited' 
                className="character-checkbox-input game-mode-select-checkbox">
              </input>
              <div className="character-checkbox-content">
                <p>Unlimited</p>
              </div>
            </label>
          </div>
          <ButtonWithArrows description="Give me" unit="minutes" id="time-selector"/>
        </div>
    </div>
  )
}
