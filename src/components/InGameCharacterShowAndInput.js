import React from 'react'
import { useState } from 'react'
import { kanaCharacters } from '../kanaCharacters.js'
import UserGameScoreWindow from './UserGameScoreWindow.js'

let currentElementToPickList = []
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

/* userStats object structure:
{
    "あ": {
        "totalRightGuesses": 6,
        "totalTouchWrongGuesses": 1,
        "totaltotalResponseTime":2.36,
        "totalAskForHelpCounter": 3,
        "currentGameStats": {
          "rightGuesses":1,
          "touchWrongGuesses":0,
          "totalResponseTime":1.33,
          "askForHelpCounter":0
        }
        "last7DaysStats": [
            {
                "date": 12379898722,
                "rightGuesses": 3,
                "TouchwrongGuesses": 1,
                "totalResponseTime": 1.45,
                "askForHelpCounter": 1
            }
        ]
    }
}
*/
if (localStorage.getItem('userStats') === null) {
  localStorage.setItem('userStats', "{}")
}

// This timer is set to current time when a new kana is showned. 
// We use it to calculate how long it takes the user to respond.
let kanaTimeToAnswerTimer = 0;
let inGameKanaOnScreen = ""

export default function InGameCharacterShowAndInput() {

  /* 
    ##########################################
    # Creates and handles the Kana character #
    ##########################################
  */
  const [onScreenKana, setKana] = useState('');
  const [onScreenSolution, setSolution] = useState('');
  const [onScreenWordMeaning, setWordMeaning] = useState('');
  const [onScreenScore, setScore] = useState(0);
  const [userGameScoreWindowVisible, setUserGameScoreWindowVisible] = useState(false);
  let currentScore = 0;
  let inGameAnswerList = [];

  const characterGroupsToShow = JSON.parse(localStorage.getItem("checkedKanas"))


  // Creates a list of all possible Kanas/Words to show, the element outputs look like this: 
  // { "jp_character": "あ", "romanji": ["a"], "sound": "あ", "type": "kana/word", *"vocal": "a", *"meaning": "dog" }
  // *The key "vocal" only shows up when the type is "kana"
  // *The key "meaning" only shows up when the type is "word"
  let charactersToShow = []
  if (localStorage.getItem("game-mode-word") === "true") {
    charactersToShow = getListOfWords(characterGroupsToShow)
  } else {
    charactersToShow = getListOfKanas(characterGroupsToShow);
  }


  function getListOfKanas(charGroups) {
    let output = []
    Object.entries(kanaCharacters).forEach(([key, category]) => {
      Object.entries(category).forEach(([key, charGroup]) => {
        if (charGroups.includes(charGroup.title)) {
          Object.entries(charGroup.characters).forEach(([charVocal, char]) => {
            char.vocal = charVocal;
            char.type = "kana";
            output.push(char);
          });
        }
      });
    });
    return output;
  }

  function getListOfWords(charGroups) {
    let output = []
    Object.entries(kanaCharacters.words).forEach(([key, value]) => {
      let ignoreWord = false;
      for(let i = 0; i < value.hiragana_groups.length; i++){
        if(!charGroups.includes(value.hiragana_groups[i])) {
          ignoreWord = true;
        }
      }
      for(let i = 0; i < value.katakana_groups.length; i++){
        if(!charGroups.includes(value.katakana_groups[i])) {
          ignoreWord = true;
        }
      }
      if(!ignoreWord) {
        output.push({
          "jp_character": value.jp_character,
          "romanji": value.romanji,
          "sound": value.sound,
          "meaning": value.meaning,
          "type": "word",
        })
      }
    })
    return output;
  }

  // Helper function to get n random unique elements from an array
  function sample(inputArray, numberOfOutputs, onePerVocal = false) {
    const vocals = ["a", "i", "u", "e", "o"];
    let current_vocal = 0;

    // Create a copy of the original array to avoid modifying it
    const copyArray = [...inputArray];
    const sampledElements = [];

    if (inputArray.length < numberOfOutputs) {
      inputArray = inputArray.concat(inputArray);
      onePerVocal = false;
    }

    // If n is greater than the size of a, set possible unique outputs to the size of array
    const numberOfUniqueOutputs = Math.min(numberOfOutputs, copyArray.length);

    for (let i = 0; i < numberOfUniqueOutputs; i++) {
      while (true) {
        const randomIndex = Math.floor(Math.random() * copyArray.length);
        if (onePerVocal) {
          if (copyArray[randomIndex].vocal === vocals[current_vocal]) {
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
    for (let i = 0; i < possibleAnswers.length; i++) {
      if (possibleAnswers[i].vocal === picked_kana.vocal) {
        Object.assign(possibleAnswers[i], picked_kana)
      }
    }

    // Go over the elements
    for (let i = 0; i < elements.length; i++) {
      elements[i].textContent = possibleAnswers[i].romanji;
    }
  }

  function resetCurentGameStats() {
    let currentUserStats = JSON.parse(localStorage.getItem('userStats'));
    for (const kana in currentUserStats) {
      if (currentUserStats[kana].currentGameStats === undefined) {
        currentUserStats[kana].currentGameStats = {}
      }
      currentUserStats[kana].currentGameStats.rightGuesses = 0;
      currentUserStats[kana].currentGameStats.touchWrongGuesses = 0;
      currentUserStats[kana].currentGameStats.totalResponseTime = 0;
      currentUserStats[kana].currentGameStats.askForHelpCounter = 0;
    }
    localStorage.setItem('userStats', JSON.stringify(currentUserStats));
  }

  function updateCurrentGameStats(guessType) {
    const currentTime = Date.now();
    let currentUserStats = JSON.parse(localStorage.getItem('userStats'));
    if (currentUserStats[inGameKanaOnScreen] === undefined) {
      currentUserStats[inGameKanaOnScreen] = {
        currentGameStats: { rightGuesses:0, touchWrongGuesses:0, totalResponseTime:0, askForHelpCounter:0 },
        last7DaysStats: [],
        totalRightGuesses: 0,
        totalTouchWrongGuesses: 0,
        totaltotalResponseTime: 0,
        totalAskForHelpCounter: 0,
      }
    }
    if (guessType === "correct") {
      currentUserStats[inGameKanaOnScreen].currentGameStats.totalResponseTime += (currentTime - kanaTimeToAnswerTimer);
      currentUserStats[inGameKanaOnScreen].currentGameStats.rightGuesses++;
    } else if (guessType === "wrong") {
      currentUserStats[inGameKanaOnScreen].currentGameStats.touchWrongGuesses++;
    } else if (guessType === "askForHelp") {
      currentUserStats[inGameKanaOnScreen].currentGameStats.askForHelpCounter++;
    }
    localStorage.setItem('userStats', JSON.stringify(currentUserStats));
  }


  // Function gets called at the beginning and every time the kana changes
  function showNewCharacter() {

    // Check if the user already answered its kana limits. If so, show stats.
    // We get the score with document because the variable onScreenScore 
    // doesnt want to give it to us :( The regex is to just get the number
    const gameMode = JSON.parse(localStorage.getItem("gameMode"))
    if( gameMode.type === "kana-selector" && 
        gameMode.value !== -1 &&  
        document.getElementById("in-game-score").textContent.replace(/^\D+/g, '') >= gameMode.value){
      setUserGameScoreWindowVisible(true);
    }

    // If we already used the full list of unique random picked, fill it again
    if (currentElementToPickList.length === 0) {
      currentElementToPickList = sample(charactersToShow, Math.floor(charactersToShow.length))
    }

    // Reset visibility of help
    document.querySelector('#in-game-kana-solution').classList.add("hidden-element")

    // Get and show the current Kana
    const pickedElement = currentElementToPickList.pop()
    inGameKanaOnScreen = pickedElement.jp_character
    setKana(inGameKanaOnScreen)
    inGameAnswerList = pickedElement.romanji
    setSolution(inGameAnswerList)
    if(pickedElement.type === "word") {
      setWordMeaning(pickedElement.meaning)
    }

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
      fillTouchAnswers(pickedElement);
    }

    document.querySelector("#in-game-kana-character>p").style.fontSize = "35vh";
    document.querySelector("#in-game-kana-character>p").setAttribute("data-word-wraped","false")

    kanaTimeToAnswerTimer = Date.now();

    // Get angry if the user keeps submiting correct answers while on the stats window
    if (document.querySelector('.inGameUserGameScoreBackground')) {
      alert("Hey! ( ｡ •̀ ᴖ •́ ｡) Stop responding you silly")
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
      const InGameTextInput = document.querySelector('#in-game-text-input-before-cursor');
      const InGameTextInputAfterCursor = document.querySelector('#in-game-text-input-after-cursor');

      if (e.key.match(/^[^?]$/)) {
        InGameTextInput.textContent += e.key;
      } else if (e.key === 'Backspace') {
        InGameTextInput.textContent = InGameTextInput.textContent.slice(0, -1);
      } else if (e.key === 'Shift') {
        document.querySelector('#in-game-kana-character').classList.add("font-forceDefault");
        setTimeout(function () {
          document.querySelector('#in-game-kana-character').classList.remove("font-forceDefault");
        }, (1500))
      } else if (e.key === 'Escape') {
        setUserGameScoreWindowVisible(true);
      } else if (e.key === '?') {
        handleUserAskForHelp()
      } else if (e.key === 'ArrowLeft') {
        if (InGameTextInput.textContent.length > 0) {
          InGameTextInputAfterCursor.textContent = InGameTextInput.textContent.slice(-1) + InGameTextInputAfterCursor.textContent;
          InGameTextInput.textContent = InGameTextInput.textContent.slice(0, -1);
          InGameTextInputAfterCursor.style.visibility = "visible";
        }      
      } else if (e.key === 'ArrowRight') {
        InGameTextInput.textContent = InGameTextInput.textContent + InGameTextInputAfterCursor.textContent.slice(0,1);
        InGameTextInputAfterCursor.textContent = InGameTextInputAfterCursor.textContent.slice(1);
        if (InGameTextInputAfterCursor.textContent.length === 0) {
          InGameTextInputAfterCursor.style.visibility = "hidden";
        }
      } else if (e.key === 'Delete') {
        if(InGameTextInputAfterCursor.textContent.length > 0) {
          InGameTextInputAfterCursor.textContent = InGameTextInputAfterCursor.textContent.slice(1);
        }
      }

      const InGameCurrentAnswer = InGameTextInput.textContent + InGameTextInputAfterCursor.textContent;

      // If the user answers correctly, make that known and pass to the next character
      if (inGameAnswerList.includes(InGameCurrentAnswer.trim())) {
        updateCurrentGameStats("correct");
        currentScore += 1;
        setScore(currentScore)

        // Define a variable to decide the behavior
        // This was a suggestion to wait for the user 
        // to press enter to show the next character
        // Currently disabled
        let waitForKeyPress = false;

        if (localStorage.getItem("game-mode-word") === "true") {
          if (!document.querySelector('#in-game-kana-solution').classList.contains("hidden-element")) {
            document.querySelector('#in-game-kana-solution').classList.add("hidden-element");
          }
          document.querySelector('#in-game-solution').classList.remove("hidden-element");

          if (waitForKeyPress) {
            // Define the function for keydown event
            const handleKeyDown = (event) => {
              if (event.key === 'Enter') {
                InGameTextInput.textContent = '';
                InGameTextInputAfterCursor.textContent = '';
                document.querySelector('#in-game-solution').classList.add("hidden-element");
                showNewCharacter();

                // Remove the event listener to prevent multiple listeners from being added
                document.removeEventListener('keydown', handleKeyDown);
              }
            };

            // Listen for 'Enter' key press
            document.addEventListener('keydown', handleKeyDown);
          } else {
            setTimeout(function () {
              InGameTextInput.textContent = '';
              InGameTextInputAfterCursor.textContent = '';
              document.querySelector('#in-game-solution').classList.add("hidden-element");
              showNewCharacter();
            }, 1000);
          }
        }
        else {
          // Wait 200 milisecond and then clear the input field and show a new character
          setTimeout(function () {
            InGameTextInput.textContent = '';
            InGameTextInputAfterCursor.textContent = '';
            showNewCharacter();
          }, 200)
        }
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
    function getFontSizeInVH(element) {
      const computedStyles = window.getComputedStyle(element);
      const fontSizeInPixels = parseFloat(computedStyles.fontSize);
      const viewportHeight = window.innerHeight;
      const fontSizeInVh = (fontSizeInPixels / viewportHeight) * 100;
      return fontSizeInVh;
    }
    function onLineWrapDoSomething() {
      const kanaCharacter = document.querySelector("#in-game-kana-character>p")
      // kanaCharacter.style.fontSize = "35vh";
      const lineHeight = window.getComputedStyle(kanaCharacter).getPropertyValue('font-size');
      const lineHeightParsed = parseInt(lineHeight.split('px')[0]);
      const amountOfLinesTilAdjust = 2;
      const isWraped = kanaCharacter.getAttribute("data-word-wraped") === "true"
      if(isWraped & getFontSizeInVH(kanaCharacter)>=35) {
        kanaCharacter.style.fontSize = "35vh";
        kanaCharacter.setAttribute("data-word-wraped","false")
      }
      else if (isWraped){
        kanaCharacter.style.fontSize = (90/kanaCharacter.textContent.length) + "vw";
        kanaCharacter.setAttribute("data-word-wraped","true")
      } else if (!isWraped & kanaCharacter.offsetHeight >= (lineHeightParsed * amountOfLinesTilAdjust)) {
        kanaCharacter.style.fontSize = (90/kanaCharacter.textContent.length) + "vw";
        kanaCharacter.setAttribute("data-word-wraped","true")
      } 
      
    }

    // window.addEventListener('resize', onLineWrapDoSomething)

    //handles style changes on banner to check wrapping
    setInterval(onLineWrapDoSomething,100)

    function handleFocus() {
      document.querySelector('#in-game-text-input').focus();
      cursorBlinkInterval = window.setInterval(function () {
        try {
          if (document.querySelector('#in-game-text-input-cursor').style.visibility === 'visible') {
            document.querySelector('#in-game-text-input-cursor').style.visibility = 'hidden';
          } else {
            document.querySelector('#in-game-text-input-cursor').style.visibility = 'visible';
          }
        } catch (error) {

        }
      }, 700);
    }
    if (localStorage.getItem("game-mode-touch") !== "true") {
      handleFocus();
    }
    resetCurentGameStats();
    showNewCharacter();
    return () => {
      clearInterval(cursorBlinkInterval);
    }
  }, []);

  function handleUserAskForHelp() {
    if (document.querySelector('#in-game-kana-solution').classList.contains("hidden-element")) {
      updateCurrentGameStats('askForHelp')
      document.querySelector('#in-game-kana-solution').classList.remove("hidden-element")
    }
  }

  /* 
  ########################
  # Touch input handlers #
  ########################
  */
  function onClickAnswerButtonHandler(event) {
    if (onScreenSolution.includes(event.target.firstChild.textContent)) {
      updateCurrentGameStats("correct");
      setScore(onScreenScore + 1)
      showNewCharacter();
    } else {
      updateCurrentGameStats("wrong");
      // Animate the element in ID in-game-kana-character using the class animation-wrong
      document.querySelector('#in-game-kana-character').classList.add("animation-wrong1");
      setTimeout(function () {
        document.querySelector('#in-game-kana-character').classList.remove("animation-wrong1");
      },300)
    }
  }

  function onClickChangeFontToDefault(event) {
    document.querySelector('#in-game-kana-character').classList.add("font-forceDefault");
    setTimeout(function () {
      document.querySelector('#in-game-kana-character').classList.remove("font-forceDefault");
    }, (1500))
  }

  function onClickExitButton(event) {
    setUserGameScoreWindowVisible(true);
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
          <div key={'in-game-touch-answer-' + i} className='in-game-touch-answer' onClick={onClickAnswerButtonHandler}>
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
        <span id='in-game-text-input-before-cursor'></span>
        <div id='in-game-text-input-cursor'></div>
        <span id='in-game-text-input-after-cursor'></span>
      </div>
      <input type="text" id='in-game-text-input' />
    </>
  }

  return (
    <>
      <div className="in-game-top-var">
        <div className='in-game-score' id='in-game-score'>Kanas {onScreenScore}</div>
        <div className='in-game-help-bar'>
          <div onClick={handleUserAskForHelp}><strong>?</strong>: help</div>
          {(localStorage.getItem("game-mode-random-fonts") === "true") ? <div onClick={onClickChangeFontToDefault}><strong>shift</strong>: normal font</div> : <div></div>}
        </div>
        <div onClick={onClickExitButton} className='in-game-exit-button'>✖</div>
      </div>
      <div className='in-game-game-screen'>

        <div id='in-game-kana-character' onClick={onClickChangeFontToDefault} className='in-game-kana-character'>
          <p>
            {onScreenKana}
          </p>
        </div>
        <div id='in-game-solution' className='in-game-solution hidden-element'>
          {onScreenWordMeaning}
        </div>
        <div id='in-game-kana-solution' className='in-game-solution hidden-element'>
          {onScreenSolution}
        </div>
        {inGameInputElement}
        <div className='hidden-text-for-font-loading'>
          {
            // Go with a for loop over every font, and create an element p with a class of the font
            fontClassList.map((fontClass) => {
              return (
                <p className={"font-" + fontClass} key={"font-" + fontClass}>a</p>
              )
            })
          }
        </div>
      </div>
      <UserGameScoreWindow
        visible={userGameScoreWindowVisible}
      />
    </>
  )
}
