import React from 'react'
import ButtonWithArrows from './ButtonWithArrows'

export default function GameModeSelector() {
  return (
    <div>
        <h2>Select a mode:</h2>
        <ButtonWithArrows description="Let's do" unit="Kanas"/>
        <button>Unlimited</button>
        <ButtonWithArrows description="I have" unit="minutes to practice"/>
    </div>
  )
}
