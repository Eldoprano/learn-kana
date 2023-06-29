import React from 'react'
import ButtonWithArrows from './ButtonWithArrows'

export default function GameModeSelector() {
  return (
    <div className='game-mode-selector-group'>
        <h2>Select a mode:</h2>
        <div className='game-mode-selector-button-group'>
          <ButtonWithArrows description="Give me" unit="Kanas" id="kana-selector"/>
          <div className='button-with-arrows'>
            <label>
              <input type="radio" checked="checked" name="button-with-arrows" id='time-selector' class="character-checkbox-input"></input>
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
