import React from 'react'
import { useState } from 'react'
import { kanaCharacters } from '../kanaCharacters.js'

export default function InGameCharacterShowAndInput() {
  const [onScreenKana, setKana] = useState('あ');
  let inGameAnswerList = '';

  const characterGroupsToShow = localStorage.getItem("checkedKanas")
  // List with its elements looking as follow
  // {
  //     "jp_character": "あ",
  //     "romanji": ["a"],
  //     "sound": "あ"
  // }
  let charactersToShow = []

  Object.entries(kanaCharacters).forEach(([key, value]) => {
    Object.entries(value).forEach(([key2, value2]) => {
      if (characterGroupsToShow.includes(value2.title)) {
        Object.entries(value2.characters).forEach(([key3, value3]) => {
          charactersToShow.push(value3);
        });
      }
    });
  });

  function showNewCharacter() {
    const randomNumber = Math.floor(Math.random() * charactersToShow.length)
    setKana(charactersToShow[randomNumber].jp_character)
    
    // Get the answer from the kanaCharacters dictionary
    inGameAnswerList = charactersToShow[randomNumber].romanji
  }
  // Load Character at start
  React.useEffect(() => {
    window.addEventListener('load', showNewCharacter);
    return () => {
      window.removeEventListener("load", showNewCharacter);
    };
  }, []);

  // ---- Character Input handlers ----
  function handleKeyDown(e) {
    // Check if key is a printable character and append it to the input field
    const InGameTextInput = document.querySelector('#in-game-text-input-cursor-group span');
    if (e.key.match(/^[A-Za-z0-9 ]+$/) && e.key.length === 1) {
      InGameTextInput.textContent += e.key;
    } else if (e.key === 'Enter') {
      InGameTextInput.textContent += '\n';
    } else if (e.key === 'Backspace') {
      InGameTextInput.textContent = InGameTextInput.textContent.slice(0, -1);
    }

    if(inGameAnswerList.includes(InGameTextInput.textContent)){
      // Wait 1 second and then clear the input field and show a new character
      setTimeout(function () {
        InGameTextInput.textContent = '';
        showNewCharacter();
      },200)
    }
  }
  
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleFocus() {
    document.querySelector('#in-game-text-input').focus();
    window.setInterval(function () {
      if (document.querySelector('#in-game-text-input-cursor').style.visibility === 'visible') {
        document.querySelector('#in-game-text-input-cursor').style.visibility = 'hidden';
      } else {
        document.querySelector('#in-game-text-input-cursor').style.visibility = 'visible';
      }
    }, 700);
  }
  React.useEffect(() => {
    window.addEventListener('load', handleFocus);
    return () => {
      window.removeEventListener("load", handleFocus);
    };
  }, []);


  return (
    <>
      <div className='in-game-kana-character'>{onScreenKana}</div>
      {/* <div className='in-game-romanji-character'>a</div> */}

      <div id='in-game-text-input-cursor-group'>
        <span></span>
        <div id='in-game-text-input-cursor'></div>
      </div>
      <input type="text" id='in-game-text-input' />
      <p id="hidden-text-for-font-loading">a</p>
    </>
  )
}
