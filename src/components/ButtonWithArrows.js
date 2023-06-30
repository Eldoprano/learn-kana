import React from 'react'
import { useState } from 'react'

export default function ButtonWithArrows(props) {
  const [value, setValue] = useState(5);

  const handleMinus = (e) => {
    let newValue = 5;
    if (value > 5 && value <= 50) {
      newValue = value - 5;
    } else if (value > 50) {
      newValue = value - 10;
    }

    // Mark the checkbox as checked
    e.target.nextElementSibling.firstElementChild.checked = true;

    localStorage.setItem("gameMode", JSON.stringify({
      "type": e.target.nextElementSibling.getAttribute("data-gamemode"),
      "value": newValue
    }));

    setValue(newValue);
  }

  const handlePlus = (e) => {
    let newValue = 5;
    if (value < 50) {
      newValue = value + 5;
    } else if (value >= 50) {
      newValue = value + 10;
    }

    // Mark the checkbox as checked
    e.target.previousElementSibling.firstElementChild.checked = true;

    // Value is stored under data-gamemode
    localStorage.setItem("gameMode", JSON.stringify({
      "type": e.target.previousElementSibling.getAttribute("data-gamemode"),
      "value": newValue
    }));

    setValue(newValue);
  }

  const handleMarked = (e) => {
    // Mark the checkbox as checked
    if (e.target.checked) {
      let localGameMode = JSON.parse(localStorage.getItem("gameMode"));
      localGameMode.type = e.target.parentElement.getAttribute("data-gamemode");
      localGameMode.value = value;
      localStorage.setItem("gameMode", JSON.stringify(localGameMode));
    }
  }

  return (
    <div className='button-with-arrows'>
      <button id={props.id + '-minus'} onClick={handleMinus}>-</button>
      <label key={props.id} data-gamemode={props.id}>
        <input type="radio" 
          onChange={handleMarked} 
          name="button-with-arrows-group" 
          className="character-checkbox-input game-mode-select-checkbox" />
        <div className="character-checkbox-content">
          <p id={props.id + '-name'}>{props.description} {value} {props.unit}</p>
        </div>
      </label>

      <button id={props.id + '-plus'} onClick={handlePlus}>+</button>
    </div>
  )
}
