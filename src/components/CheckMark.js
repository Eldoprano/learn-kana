import React, {useEffect} from 'react'

export default function CheckMark(props) {
  useEffect(() => {
    let initValue = props.default;
    if(props.default === undefined) {
        initValue = "false";
    }
    // Set the default values or the values from the localStorage for the checkMarks
    if(localStorage.getItem(props.id) === null) {
        localStorage.setItem(props.id, initValue);
    }
    document.getElementById(props.id).checked = (localStorage.getItem(props.id) === "true"); // Cool trick, huh?
  })

  const handleCheckMarked = (e) => {
    // Mark the checkbox as checked
    localStorage.setItem(props.id, e.target.checked);

    // Temp solution: Unmark #game-mode-touch when #game-mode-word is checked
    if(props.id === "game-mode-word" && e.target.checked) {
        localStorage.setItem("game-mode-touch", false);
        document.getElementById("game-mode-touch").checked = false;
    } else if (props.id === "game-mode-touch" && e.target.checked) {
        localStorage.setItem("game-mode-word", false);
        document.getElementById("game-mode-word").checked = false;
    }
  }
  
  return (
    <label className="character-checkbox-element" key={props.id}>
        <input type="checkbox"
            id={props.id} 
            className={"character-checkbox-input " + props.class}
            onChange={handleCheckMarked} />
        <div className="character-checkbox-content">
            <p>{props.characterText}</p>
        </div>
    </label>
  )
}