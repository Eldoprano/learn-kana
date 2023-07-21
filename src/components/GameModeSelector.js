import React from 'react'
import ButtonWithArrows from './ButtonWithArrows'
import CheckMark from './CheckMark';

export default function GameModeSelector() {

  // At start with react we check if we have values for the buttons saved on localStorage
  React.useEffect(() => {
    // Check if we have a value for the time-selector
    if (localStorage.getItem("gameMode")) {
      const gameMode = JSON.parse(localStorage.getItem("gameMode"));
      if (gameMode.type === "kana-selector" && gameMode.value === -1) {
        document.getElementById("time-selector-unlimited-radio-button").checked = true;
      } else if (gameMode.type === "time-selector") {
        document.getElementById("time-selector-radio-button").checked = true;
        gameMode.value = 5;
      } else if (gameMode.type === "kana-selector") {
          document.getElementById("kana-selector-radio-button").checked = true;
          gameMode.value = 5;
      }
      localStorage.setItem("gameMode", JSON.stringify(gameMode));
    } else {
      // Initialize localStorage
      localStorage.setItem("gameMode", JSON.stringify({
        "type": "kana-selector",
        "value": -1
      }));
    }

    if(localStorage.getItem("game-mode-touch") === undefined  || localStorage.getItem("game-mode-touch") === "true") {
      document.getElementById("game-mode-touch").checked = true;
      localStorage.setItem("game-mode-touch", "true");
    } else {
      document.getElementById("game-mode-touch").checked = false;
      localStorage.setItem("game-mode-touch", "false");
    }
  }
  );

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
                id='time-selector-unlimited-radio-button' 
                className="character-checkbox-input game-mode-select-checkbox">
              </input>
              <div className="character-checkbox-content">
                <p>Unlimited</p>
              </div>
            </label>
          </div>
          <ButtonWithArrows description="Give me" unit="minutes" id="time-selector"/>
        </div>
        <div className='game-mode-selector-button-group'>
          <CheckMark characterText="Touch Mode" class="game-mode-selector-button-group-row-2" id="game-mode-touch"/>
          <CheckMark characterText="Handwritten Fonts" class="game-mode-selector-button-group-row-2" id="game-mode-random-fonts"/>
        </div>
    </div>
  )
}
