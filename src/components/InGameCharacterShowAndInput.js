import React from 'react'
import { useState } from 'react'
import { kanaCharacters } from '../kanaCharacters.js'
import { Link } from "react-router-dom";

let currentKanaToPickList = []
let fontClassList = [
  // "Belanosima",
  "KleeOne",
  "Kaisei_Tokumin",
  "Noto_Serif_JP",
  "Shippori_Mincho",
  "Tsukimi_Rounded",
  "YokoMoji",
  "LeftHanded",
  // "JiyunoTsubasa",
  // "KleeOne",
  "YujiBoku",
]
export default function InGameCharacterShowAndInput() {

  /* 
    ##########################################
    # Creates and handles the Kana character #
    ##########################################
  */
  const [onScreenKana, setKana] = useState('');
  const [onScreenSolution, setSolution] = useState('');
  const [onScreenScore, setScore] = useState(0);
  let currentScore = 0;
  let inGameAnswerList = '';

  const characterGroupsToShow = localStorage.getItem("checkedKanas")

  // Creates a list of all possible Kanas to show, with its elements looking as follow: 
  // { "jp_character": "あ", "romanji": ["a"], "sound": "あ", "vocal": "a" }
  let charactersToShow = []
  Object.entries(kanaCharacters).forEach(([key, value]) => {
    Object.entries(value).forEach(([key2, value2]) => {
      if (characterGroupsToShow.includes(value2.title)) {
        Object.entries(value2.characters).forEach(([key3, value3]) => {
          value3.vocal = key3;
          charactersToShow.push(value3);
        });
      }
    });
  });

  // Helper function to get n random unique elements from an array
  function sample(inputArray, numberOfOutputs, onePerVocal=false) {
    const vocals = ["a", "i", "u", "e", "o"]; 
    let current_vocal = 0;

    // Create a copy of the original array to avoid modifying it
    const copyArray = [...inputArray];
    const sampledElements = [];

    // If n is greater than the size of a, set possible unique outputs to the size of array
    const numberOfUniqueOutputs = Math.min(numberOfOutputs, copyArray.length);

    for (let i = 0; i < numberOfUniqueOutputs; i++) {
      while(true) {
        const randomIndex = Math.floor(Math.random() * copyArray.length);
        if(onePerVocal) {
          if(copyArray[randomIndex].vocal === vocals[current_vocal]) {
            current_vocal++;
          } else { continue }
        }
        sampledElements.push(copyArray[randomIndex]);
        // Remove the selected element from the copyArray to avoid duplicates
        copyArray.splice(randomIndex, 1);
        break;
      }
    }

    // If still space, fill it with duplicate elements
    const remainingOutputs = numberOfOutputs - numberOfUniqueOutputs;
    for (let i = 0; i < remainingOutputs; i++) {
      const randomIndex = Math.floor(Math.random() * numberOfUniqueOutputs);
      sampledElements.push(sampledElements[randomIndex]);
    }

    return sampledElements;
  }

  /* 
  ##########################################
  # Creates and handles the touch answers #
  ##########################################
  */
  function fillTouchAnswers(picked_kana) {
    const possibleAnswers = sample(charactersToShow, 5, true);
    const elements = document.querySelectorAll('.in-game-touch-answer>p');
    const randomIndex = Math.floor(Math.random() * elements.length);
    for (let i = 0; i < possibleAnswers.length; i++) {
      if(possibleAnswers[i].vocal === picked_kana.vocal) {
        Object.assign(possibleAnswers[i], picked_kana)
      }
    }

    // Go over the elements
    for (let i = 0; i < elements.length; i++) {
      elements[i].textContent = possibleAnswers[i].romanji;
    }
  }


  // Function gets called at the beginning and every time the kana changes
  function showNewCharacter() {
    if (currentKanaToPickList.length === 0) {
      currentKanaToPickList = sample(charactersToShow, Math.floor(charactersToShow.length))
    }
    // console.log(currentKanaToPickList)
    const picked_kana = currentKanaToPickList.pop()
    setKana(picked_kana.jp_character)
    inGameAnswerList = picked_kana.romanji
    setSolution(inGameAnswerList)

    if (localStorage.getItem("game-mode-random-fonts") === "true") {
      const randomFontIndex = Math.floor(Math.random() * fontClassList.length);
      const fontClass = fontClassList[randomFontIndex];
      // First we delete any class that begins with the word font
      document.querySelector('#in-game-kana-character').classList.forEach(element => {
        if (element.startsWith('font-')) {
          document.querySelector('#in-game-kana-character').classList.remove(element);
        }
      });

      // Then we add the new class
      document.querySelector('#in-game-kana-character').classList.add("font-" + fontClass);
    }

    if (localStorage.getItem("game-mode-touch") === "true") {
      fillTouchAnswers(picked_kana);
    }
  }

  /* 
  #######################
  # Text input handlers #
  #######################
  */
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
      } else if (e.key === 'Shift') {
        document.querySelector('#in-game-kana-character').classList.add("font-forceDefault");
        setTimeout(function () {
          document.querySelector('#in-game-kana-character').classList.remove("font-forceDefault");
        },(1500))
      }

      if (inGameAnswerList.includes(InGameTextInput.textContent.trim())) {
        // Wait 1 second and then clear the input field and show a new character
        currentScore += 1;
        setScore(currentScore)
        setTimeout(function () {
          InGameTextInput.textContent = '';
          showNewCharacter();
        }, 200)
      }
    }
    if (localStorage.getItem("game-mode-touch") !== "true") {
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
    if (localStorage.getItem("game-mode-touch") !== "true") {
      handleFocus();
    }
    showNewCharacter();

    return () => {
      clearInterval(cursorBlinkInterval);
    }
  }, []);

  /* 
  ########################
  # Touch input handlers #
  ########################
  */
 function onClickAnswerButtonHandler(event) {
   if (onScreenSolution.includes(event.target.firstChild.textContent)) {
     setScore(onScreenScore + 1)
     showNewCharacter();
   } else {
    alert("Wrong answer!");
   }
 }

 function onClickChangeFontToDefault(event) {
    document.querySelector('#in-game-kana-character').classList.add("font-forceDefault");
    setTimeout(function () {
      document.querySelector('#in-game-kana-character').classList.remove("font-forceDefault");
    },(1500))
 }

  /* 
  ######################################################
  # Decide wether to use touch or keyboard for answers #
  ######################################################
  */

  // Make answer input via touch buttons
  let inGameInputElement = <></>
  if (localStorage.getItem("game-mode-touch") === "true") {
    function makeTouchAnswerDivs(params) {
      const numberOfAnswers = 5;
      const answerElements = [];
    
      for (let i = 0; i < numberOfAnswers; i++) {
          answerElements.push((
            <div className='in-game-touch-answer' onClick={onClickAnswerButtonHandler}>
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

  // Make answer input via keyboard
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
        <Link to='/learn-kana' className='in-game-exit-button'>
          <div>✖</div>
        </Link>
      </div>
      <div className='in-game-game-screen'>

        <div id='in-game-kana-character' onClick={onClickChangeFontToDefault} className='in-game-kana-character'>
            {onScreenKana}
        </div>
        {inGameInputElement}
        <div className='hidden-text-for-font-loading'>
        {
          // Go with a for loop over every font, and create an element p with a class of the font
          fontClassList.map((fontClass) => {
            return (
              <p className={"font-" + fontClass}>a</p>
            )
            })
        }
        </div>
      </div>

    </>
  )
}
