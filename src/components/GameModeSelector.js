import React from 'react'
import ButtonWithArrows from './ButtonWithArrows'

export default function GameModeSelector() {
  return (
    <div className='game-mode-selector-group'>
        <h2>Select a mode:</h2>
        <div className='game-mode-selector-button-group'>
          <ButtonWithArrows description="Let's do" unit="Kanas" id="kana-selector"/>
          <lable>
            <input type="radio" name="button-with-arrows" id='time-selector' class="character-checkbox-input"></input>
            <div className="character-checkbox-content">
              <p>Unlimited</p>
            </div>
          </lable>
          <ButtonWithArrows description="I have" unit="minutes to practice" id="time-selector"/>
        </div>
    </div>
  )
}
