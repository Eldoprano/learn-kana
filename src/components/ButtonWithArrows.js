import React from 'react'

export default function ButtonWithArrows(props) {
  return (
    <div className='button-with-arrows'>
        <button>-</button>
        <label key={props.id}>
            <input type="radio" name="button-with-arrows" className="character-checkbox-input" />
            <div className="character-checkbox-content">
                <p>{props.description} 5 {props.unit}</p>
            </div>
        </label>

        <button>+</button>
    </div>
  )
}
