import React from 'react'

export default function ButtonWithArrows(props) {
  return (
    <div>
        <button>-</button>
        <button>{props.description} 5 {props.unit}</button>
        <button>+</button>
    </div>
  )
}
