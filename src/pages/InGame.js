import React from 'react'
import InGameProgress from '../components/InGameProgress'
import InGameExit from '../components/InGameExit'
import InGameShowCharacter from '../components/InGameShowCharacter'
import InGameWriteAnswer from '../components/InGameWriteAnswer'

export default function InGame() {
  return (
    <>
        <div className="in-game-top-var">
            <InGameProgress/>
            <InGameExit />
        </div>
        <div className='in-game-game-screen'>
            <InGameShowCharacter />
            <InGameWriteAnswer />
        </div>
    </>
  )
}