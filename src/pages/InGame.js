import React from 'react'
import InGameProgress from '../components/InGameProgress'
import InGameExit from '../components/InGameExit'
import InGameCharacterShowAndInput from '../components/InGameCharacterShowAndInput'

export default function InGame() {
  return (
    <>
      <div className='in-game-container'>
        <div className="in-game-top-var">
          <InGameProgress />
          <InGameExit />
        </div>
        <div className='in-game-game-screen'>
          <InGameCharacterShowAndInput />
        </div>
      </div>
    </>
  )
}