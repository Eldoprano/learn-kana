import React from 'react'
import { useState } from 'react'
import { kanaCharacters } from '../kanaCharacters.js'
import { Link } from "react-router-dom";


export default function InGameCharacterShowAndInput() {
  const [onScreenKana, setKana] = useState('');
  const [onScreenScore, setScore] = useState(0);
  let currentScore = 0;
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

  function sample(inputArray, numberOfOutputs, ignoredCharacters=[]) {
    // Create a copy of the original array to avoid modifying it
    const copyArray = [...inputArray];
    const sampledElements = [];
    for (let i = 0; i < copyArray.length; i++){
      if (ignoredCharacters.includes(copyArray[i].jp_character)) {
        // Remove the selected element from the copyArray to avoid duplicates
        copyArray.splice(i, 1);
        i--;
      }
    }
    // If n is greater than the size of a, set n to the size of a
    numberOfOutputs = Math.min(numberOfOutputs, copyArray.length);
    for (let i = 0; i < numberOfOutputs; i++) {
      const randomIndex = Math.floor(Math.random() * copyArray.length);
      sampledElements.push(copyArray[randomIndex]);
      // Remove the selected element from the copyArray to avoid duplicates
      copyArray.splice(randomIndex, 1);
    }
    return sampledElements;
  }

  function fillTouchAnswers(picked_kana) {
    const possibleAnswers = sample(charactersToShow, 10, [picked_kana]);
    const elements = document.querySelectorAll('.in-game-touch-answer>p');
    const randomIndex = Math.floor(Math.random() * elements.length);

    // Go over the elements
    for (let i = 0; i < elements.length; i++) {
      // If the current element is the one we want to fill, fill it
      if (i === randomIndex) {
        elements[i].textContent = inGameAnswerList;
      } else {
        elements[i].textContent = possibleAnswers[i].romanji;
      }
    }
  }

  let currentKanaToPickList = []
  function showNewCharacter() {
    if (currentKanaToPickList.length === 0) {
      currentKanaToPickList = sample(charactersToShow, 10)
    }
    const picked_kana = currentKanaToPickList.pop()
    setKana(picked_kana.jp_character)
    inGameAnswerList = picked_kana.romanji

    if (localStorage.getItem("game-mode-touch") === "true") {
      fillTouchAnswers(picked_kana.jp_character);
    }
  }

  // ---- Character Input handlers ----
  React.useEffect(() => {
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

      if (inGameAnswerList.includes(InGameTextInput.textContent)) {
        // Wait 1 second and then clear the input field and show a new character
        currentScore += 1;
        setScore(currentScore)
        setTimeout(function () {
          InGameTextInput.textContent = '';
          showNewCharacter();
        }, 200)
      }
    }
    if (localStorage.getItem("game-mode-touch") === "false") {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, []);

  let cursorBlinkInterval;
  React.useEffect(() => {
    function handleFocus() {
      document.querySelector('#in-game-text-input').focus();
      cursorBlinkInterval = window.setInterval(function () {
        if (document.querySelector('#in-game-text-input-cursor').style.visibility === 'visible') {
          document.querySelector('#in-game-text-input-cursor').style.visibility = 'hidden';
        } else {
          document.querySelector('#in-game-text-input-cursor').style.visibility = 'visible';
        }
      }, 700);
    }
    if (localStorage.getItem("game-mode-touch") === "false") {
      handleFocus();
    }
    showNewCharacter();

    return () => {
      clearInterval(cursorBlinkInterval);
    }
  }, []);

  let inGameInputElement = <></>
  if (localStorage.getItem("game-mode-touch") === "true") {
    function makeTouchAnswerDivs(params) {
      const numberOfAnswers = 6;
      const answerElements = [];
    
      for (let i = 0; i < numberOfAnswers; i++) {
          answerElements.push((
            <div className='in-game-touch-answer'>
              <p></p>
            </div>
          ));
        }
      return answerElements;
    }
    
    inGameInputElement = <>
      <div className='in-game-touch-answer-group'>
        {
          makeTouchAnswerDivs()
        }
      </div>
    </>
  } else {
    inGameInputElement = <>
      <div id='in-game-text-input-cursor-group'>
        <span></span>
        <div id='in-game-text-input-cursor'></div>
      </div>
      <input type="text" id='in-game-text-input' />
    </>
  }

  return (
    <>
      <div className="in-game-top-var">
        <div className='in-game-score'>Kanas {onScreenScore}</div>
        <Link to='/learn-kana#game-menu-title' className='in-game-exit-button'>
          <div>✖</div>
        </Link>
      </div>
      <div className='in-game-game-screen'>

        <div className='in-game-kana-character'>
          {onScreenKana}
        </div>
        {inGameInputElement}
        <p id="hidden-text-for-font-loading">a</p>
      </div>

    </>
  )
}
