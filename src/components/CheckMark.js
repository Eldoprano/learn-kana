import React from 'react'

export default function CheckMark(props) {

  const handleCheckMarked = (e) => {
    // Mark the checkbox as checked
    localStorage.setItem(props.id, e.target.checked);
  }
  return (
    <label className="character-checkbox-element" key={props.id}>
        <input type="checkbox"
            id={props.id} 
            className={"character-checkbox-input " + props.class}
            onChange={handleCheckMarked}
            defaultChecked={localStorage.getItem(props.id) === "true"} />
        <div className="character-checkbox-content">
            <p>{props.characterText}</p>
        </div>
    </label>
  )
}
