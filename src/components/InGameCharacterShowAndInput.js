import React from 'react'
import {  useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
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
        "totalTimesShown": 10, // New: Total times this character has been shown
        "totalRightGuesses": 6,
        "totalWrongGuesses": 1, // Changed from totalTouchWrongGuesses
        "totaltotalResponseTime": 2.36, // Sum of response times for correct guesses
        "totalAskForHelpCounter": 3,
        "currentGameStats": { // Stats for the current session/game
          "rightGuesses":1,
          "wrongGuesses":0, // Changed from touchWrongGuesses
          "totalResponseTime":1.33,
          "askForHelpCounter":0
        },
        "dailyPerformance": [ // New: Array to store daily performance metrics
            {
                "date": 1678886400000, // Timestamp for the day (e.g., midnight UTC)
                "rightGuesses": 3,
                "wrongGuesses": 1,
                "askForHelpCounter": 1,
                "responseTimeSum": 1.45 // Sum of response times for correct guesses this day
            }
            // ... more entries for other days
        ],
        "last7DaysStats": [ // Potentially deprecated or to be phased out in favor of dailyPerformance
            {
                "date": 12379898722,
                "rightGuesses": 3,
                "wrongGuesses": 1, // Changed from TouchwrongGuesses
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
let inGameKanaOnScreen = "";

async function selectNextCharacter(charactersToShow) {
  let userStats = JSON.parse(localStorage.getItem('userStats')) || {};
  let weightedCharacters = [];
  const baseWeight = 50; // Base weight for all characters
  const recencyMultiplier = 1.5; // Multiplier for characters shown recently
  const problematicRateThreshold = 0.4; // If (wrong + help) / recentShown > this, it's problematic
  const lowExposureThreshold = 10; // Times shown recently to be considered "enough data"
  const veryLowExposureThreshold = 3; // Times shown recently, below this gets high priority if any errors
  const significantErrorBonus = 40; // Bonus for high error rates
  const moderateErrorBonus = 20; // Bonus for moderate error rates
  const helpBonus = 10; // Bonus for needing help
  const noRecentDataPenalty = 0.7; // Multiplier if no recent data (to encourage re-visiting)
  const fastResponseFactor = 0.1; // Factor to slightly reduce weight for faster correct responses

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();

  for (const character of charactersToShow) {
    let weight = baseWeight;
    const stats = userStats[character.jp_character];

    if (stats) {
      let recentRightGuesses = 0;
      let recentWrongGuesses = 0;
      let recentAskForHelpCounter = 0;
      let recentResponseTimeSum = 0;
      let recentTimesShown = 0; // This will be sum of R/W/H from daily entries

      if (stats.dailyPerformance && stats.dailyPerformance.length > 0) {
        stats.dailyPerformance.forEach(daily => {
          if (daily.date >= thirtyDaysAgoTimestamp) {
            recentRightGuesses += daily.rightGuesses || 0;
            recentWrongGuesses += daily.wrongGuesses || 0;
            recentAskForHelpCounter += daily.askForHelpCounter || 0;
            recentResponseTimeSum += daily.responseTimeSum || 0;
            recentTimesShown += (daily.rightGuesses || 0) + (daily.wrongGuesses || 0) + (daily.askForHelpCounter || 0);
          }
        });
      }
      
      // Handle legacy totalTouchWrongGuesses
      const totalWrongGuessesLifetime = stats.totalWrongGuesses || stats.totalTouchWrongGuesses || 0;

      if (recentTimesShown > 0) {
        weight *= recencyMultiplier; // Boost weight if shown recently
        const errorRate = (recentWrongGuesses + recentAskForHelpCounter) / recentTimesShown;
        const helpRate = recentAskForHelpCounter / recentTimesShown;

        if (recentTimesShown < veryLowExposureThreshold && (recentWrongGuesses > 0 || recentAskForHelpCounter > 0) ) {
            weight += significantErrorBonus * 1.5; // High priority if very few encounters and any mistake
        } else if (errorRate > problematicRateThreshold) {
          weight += significantErrorBonus;
        } else if (errorRate > problematicRateThreshold / 2) {
          weight += moderateErrorBonus;
        }
        if (helpRate > problematicRateThreshold / 2) {
            weight += helpBonus;
        }

        // Adjust by average response time for correct recent guesses
        if (recentRightGuesses > 0) {
          const avgRecentResponseTime = recentResponseTimeSum / recentRightGuesses;
          // Slower responses slightly increase weight, faster slightly decrease
          weight += (avgRecentResponseTime / 1000 - 5) * fastResponseFactor; // Assuming 5s is a neutral average
        }

      } else {
        // No recent data, use lifetime stats if available, but with a penalty
        weight *= noRecentDataPenalty;
        if (stats.totalTimesShown > 0 && stats.totalTimesShown < lowExposureThreshold) {
           const lifetimeErrorRate = (totalWrongGuessesLifetime + (stats.totalAskForHelpCounter || 0)) / stats.totalTimesShown;
           if (lifetimeErrorRate > problematicRateThreshold) {
               weight += moderateErrorBonus;
           }
        }
      }
      
      // Ensure weight is not negative
      weight = Math.max(1, weight);

    } else {
      // Character never seen or no stats, give it a slightly higher base weight to encourage first view
      weight = baseWeight * 1.2;
    }
    
    // TODO: Implement a mechanism to prevent showing the same character too many times in a row.
    // (e.g., temporarily reducing weight after being shown, or a short-term exclusion list)
    // This could be a check against `inGameKanaOnScreen` if this function is called multiple times
    // for the same "next character" decision, or a short list of recently shown items.

    weightedCharacters.push({ ...character, weight });
  }

  // Weighted random selection
  let totalWeight = weightedCharacters.reduce((sum, char) => sum + char.weight, 0);

  // Handle cases where all weights are zero (e.g., initial state or after filtering)
  // In such a scenario, pick a character completely at random.
  if (totalWeight === 0) {
    const randomIndex = Math.floor(Math.random() * charactersToShow.length);
    return charactersToShow[randomIndex];
  }

  let randomNum = Math.random() * totalWeight;
  let accumulatedWeight = 0;

  for (const char of weightedCharacters) {
    accumulatedWeight += char.weight;
    if (randomNum <= accumulatedWeight) {
      return char;
    }
  }

  // Fallback in case something goes wrong (should ideally not be reached)
  return charactersToShow[Math.floor(Math.random() * charactersToShow.length)];
}

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

  // Be mad at the user if the charactersToShow is empty
  const navigate = useNavigate();
  useEffect(() => {
    if (charactersToShow.length === 0) {
      navigate('/bruh', { state: { message: 'You didn\'t select any Kana!' } });
      charactersToShow = [{ "jp_character": "あ", "romanji": ["a"], "sound": "あ", "type": "kana/word", "vocal": "a", "meaning": "dog" }]
    }
  }, [charactersToShow]);

  // game-mode-auto-next
  let autoNext = false;
  if (localStorage.getItem("game-mode-auto-next") === "true") {
    autoNext = true;
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
      for (let i = 0; i < value.hiragana_groups.length; i++) {
        if (!charGroups.includes(value.hiragana_groups[i])) {
          ignoreWord = true;
        }
      }
      for (let i = 0; i < value.katakana_groups.length; i++) {
        if (!charGroups.includes(value.katakana_groups[i])) {
          ignoreWord = true;
        }
      }
      if (!ignoreWord) {
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
      currentUserStats[kana].currentGameStats.wrongGuesses = 0; // <-- Changed
      currentUserStats[kana].currentGameStats.totalResponseTime = 0;
      currentUserStats[kana].currentGameStats.askForHelpCounter = 0;
    }
    localStorage.setItem('userStats', JSON.stringify(currentUserStats));
  }

  function updateCurrentGameStats(guessType) {
    const currentTime = Date.now();
    let currentUserStats = JSON.parse(localStorage.getItem('userStats')) || {};
    const character = inGameKanaOnScreen;

    // Initialize stats for the character if it's new
    if (!currentUserStats[character]) {
      currentUserStats[character] = {
        totalTimesShown: 0,
        totalRightGuesses: 0,
        totalWrongGuesses: 0,
        totaltotalResponseTime: 0,
        totalAskForHelpCounter: 0,
        currentGameStats: { rightGuesses: 0, wrongGuesses: 0, totalResponseTime: 0, askForHelpCounter: 0 },
        dailyPerformance: [],
        // last7DaysStats: [], // Retain if needed for other purposes, or phase out
      };
    } else {
      // Handle migration from totalTouchWrongGuesses to totalWrongGuesses
      if (currentUserStats[character].hasOwnProperty('totalTouchWrongGuesses')) {
        currentUserStats[character].totalWrongGuesses = currentUserStats[character].totalTouchWrongGuesses;
        delete currentUserStats[character].totalTouchWrongGuesses;
      }
      if (currentUserStats[character].currentGameStats && currentUserStats[character].currentGameStats.hasOwnProperty('touchWrongGuesses')) {
        currentUserStats[character].currentGameStats.wrongGuesses = currentUserStats[character].currentGameStats.touchWrongGuesses;
        delete currentUserStats[character].currentGameStats.touchWrongGuesses;
      }
    }
    
    // Ensure currentGameStats exists
    if (!currentUserStats[character].currentGameStats) {
        currentUserStats[character].currentGameStats = { rightGuesses: 0, wrongGuesses: 0, totalResponseTime: 0, askForHelpCounter: 0 };
    }
     // Ensure dailyPerformance array exists
    if (!currentUserStats[character].dailyPerformance) {
        currentUserStats[character].dailyPerformance = [];
    }

    // Update currentGameStats
    if (guessType === "correct") {
      let responseTime = currentTime - kanaTimeToAnswerTimer;
      responseTime = Math.min(responseTime, 15000); // Cap response time
      currentUserStats[character].currentGameStats.totalResponseTime += responseTime;
      currentUserStats[character].currentGameStats.rightGuesses++;
      // Update overall totals
      currentUserStats[character].totalRightGuesses = (currentUserStats[character].totalRightGuesses || 0) + 1;
      currentUserStats[character].totaltotalResponseTime = (currentUserStats[character].totaltotalResponseTime || 0) + responseTime;
    } else if (guessType === "wrong") {
      currentUserStats[character].currentGameStats.wrongGuesses++;
      currentUserStats[character].totalWrongGuesses = (currentUserStats[character].totalWrongGuesses || 0) + 1;
    } else if (guessType === "askForHelp") {
      currentUserStats[character].currentGameStats.askForHelpCounter++;
      currentUserStats[character].totalAskForHelpCounter = (currentUserStats[character].totalAskForHelpCounter || 0) + 1;
    }

    // Update dailyPerformance
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Get timestamp for midnight
    const todayTimestamp = today.getTime();

    let dailyEntry = currentUserStats[character].dailyPerformance.find(entry => entry.date === todayTimestamp);

    if (!dailyEntry) {
      dailyEntry = {
        date: todayTimestamp,
        rightGuesses: 0,
        wrongGuesses: 0,
        askForHelpCounter: 0,
        responseTimeSum: 0.0
      };
      currentUserStats[character].dailyPerformance.push(dailyEntry);
    }

    if (guessType === "correct") {
      let responseTime = currentTime - kanaTimeToAnswerTimer;
      responseTime = Math.min(responseTime, 15000); // Cap response time
      dailyEntry.rightGuesses++;
      dailyEntry.responseTimeSum += responseTime;
    } else if (guessType === "wrong") {
      dailyEntry.wrongGuesses++;
    } else if (guessType === "askForHelp") {
      dailyEntry.askForHelpCounter++;
    }
    
    localStorage.setItem('userStats', JSON.stringify(currentUserStats));
  }


  // Function gets called at the beginning and every time the kana changes
  async function showNewCharacter() {

    // Check if the user already answered its kana limits. If so, show stats.
    const gameScoreElement = document.getElementById("in-game-score");
    const gameMode = JSON.parse(localStorage.getItem("gameMode"));
    if (gameMode && gameMode.type === "kana-selector" && gameMode.value !== -1 &&
        gameScoreElement && 
        parseInt(gameScoreElement.textContent.replace(/^\D+/g, ''), 10) >= gameMode.value) {
      setUserGameScoreWindowVisible(true);
      return; // Exit early if score window is shown
    }

    // Reset visibility of help
    const helpSolutionElement = document.querySelector('#in-game-kana-solution');
    if (helpSolutionElement) {
      helpSolutionElement.classList.add("hidden-element");
    }

    // Get and show the current Kana using the new weighted selection logic
    let pickedElement = await selectNextCharacter(charactersToShow);
    
    if (!pickedElement) {
      console.warn("selectNextCharacter returned undefined. Fallback to random selection from charactersToShow.");
      if (charactersToShow.length > 0) {
        pickedElement = charactersToShow[Math.floor(Math.random() * charactersToShow.length)];
      } else {
        navigate('/bruh', { state: { message: 'No characters available to show!' } });
        return;
      }
    }
    
    inGameKanaOnScreen = pickedElement.jp_character;

    // Update totalTimesShown
    let currentUserStats = JSON.parse(localStorage.getItem('userStats')) || {};
    if (!currentUserStats[inGameKanaOnScreen]) {
      currentUserStats[inGameKanaOnScreen] = {
        totalTimesShown: 1,
        totalRightGuesses: 0,
        totalWrongGuesses: 0,
        totaltotalResponseTime: 0,
        totalAskForHelpCounter: 0,
        currentGameStats: { rightGuesses: 0, wrongGuesses: 0, totalResponseTime: 0, askForHelpCounter: 0 },
        dailyPerformance: [],
      };
    } else {
      currentUserStats[inGameKanaOnScreen].totalTimesShown = (currentUserStats[inGameKanaOnScreen].totalTimesShown || 0) + 1;
       // Ensure dailyPerformance exists for older data structures
      if (!currentUserStats[inGameKanaOnScreen].dailyPerformance) {
        currentUserStats[inGameKanaOnScreen].dailyPerformance = [];
      }
       // Handle migration for totalWrongGuesses if necessary from an even older state (pre-totalTouchWrongGuesses)
      if (!currentUserStats[inGameKanaOnScreen].hasOwnProperty('totalWrongGuesses') && !currentUserStats[inGameKanaOnScreen].hasOwnProperty('totalTouchWrongGuesses')) {
        currentUserStats[inGameKanaOnScreen].totalWrongGuesses = 0;
      }
    }
    localStorage.setItem('userStats', JSON.stringify(currentUserStats));

    setKana(pickedElement.jp_character);
    // @ts-ignore
    inGameAnswerList = pickedElement.romanji;
    // @ts-ignore
    setSolution(pickedElement.romanji);
    // @ts-ignore
    if (pickedElement.type === "word") {
      // @ts-ignore
      setWordMeaning(pickedElement.meaning);
    }

    if (localStorage.getItem("game-mode-random-fonts") === "true") {
      const randomFontIndex = Math.floor(Math.random() * fontClassList.length);
      const fontClass = fontClassList[randomFontIndex];
      const charDisplayElement = document.querySelector('#in-game-kana-character');
      if (charDisplayElement) {
        charDisplayElement.classList.forEach(cls => {
          if (cls.startsWith('font-')) {
            charDisplayElement.classList.remove(cls);
          }
        });
        charDisplayElement.classList.add("font-" + fontClass);
      }
    }

    if (localStorage.getItem("game-mode-touch") === "true") {
      // @ts-ignore
      fillTouchAnswers(pickedElement);
    }

    const charTextElement = document.querySelector("#in-game-kana-character>p");
    if (charTextElement) {
      // @ts-ignore
      charTextElement.style.fontSize = "35vh";
      charTextElement.setAttribute("data-word-wraped", "false");
    }

    kanaTimeToAnswerTimer = Date.now();

    // Get angry if the user keeps submitting correct answers while on the stats window
    if (document.querySelector('.inGameUserGameScoreBackground')) {
      alert("Hey! ( ｡ •̀ ᴖ •́ ｡) Stop responding you silly");
    }
  }

  /* 
  #######################
  # Text input handlers #
  #######################
  */
  React.useEffect(() => {
    let timeoutInProgress = false;

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
        InGameTextInput.textContent = InGameTextInput.textContent + InGameTextInputAfterCursor.textContent.slice(0, 1);
        InGameTextInputAfterCursor.textContent = InGameTextInputAfterCursor.textContent.slice(1);
        if (InGameTextInputAfterCursor.textContent.length === 0) {
          InGameTextInputAfterCursor.style.visibility = "hidden";
        }
      } else if (e.key === 'Delete') {
        if (InGameTextInputAfterCursor.textContent.length > 0) {
          InGameTextInputAfterCursor.textContent = InGameTextInputAfterCursor.textContent.slice(1);
        }
      }

      const InGameUserCurrentAnswer = InGameTextInput.textContent + InGameTextInputAfterCursor.textContent;


      ///////////////////////////////////////////////////////////////
      //////////// If the user types the correct answer! ////////////
      ///////////////////////////////////////////////////////////////
      
      if (timeoutInProgress) return;
      //  Make that known and pass to the next character
      if (inGameAnswerList.includes(InGameUserCurrentAnswer.trim().toLowerCase())) {
        updateCurrentGameStats("correct");
        currentScore += 1;
        setScore(currentScore)

        // If the user is in word mode, show the translation of the word
        if (localStorage.getItem("game-mode-word") === "true") {
          if (!document.querySelector('#in-game-kana-solution').classList.contains("hidden-element")) {
            document.querySelector('#in-game-kana-solution').classList.add("hidden-element");
          }
          document.querySelector('#in-game-solution').classList.remove("hidden-element");

          if (!autoNext) {
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
            timeoutInProgress = true;
            setTimeout(function () {
              InGameTextInput.textContent = '';
              InGameTextInputAfterCursor.textContent = '';
              document.querySelector('#in-game-solution').classList.add("hidden-element");
              showNewCharacter();
              timeoutInProgress = false;
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
      try {
        const kanaCharacter = document.querySelector("#in-game-kana-character>p")
        // kanaCharacter.style.fontSize = "35vh";
        const lineHeight = window.getComputedStyle(kanaCharacter).getPropertyValue('font-size');
        const lineHeightParsed = parseInt(lineHeight.split('px')[0]);
        const amountOfLinesTilAdjust = 2;
        const isWraped = kanaCharacter.getAttribute("data-word-wraped") === "true"
        if (isWraped & getFontSizeInVH(kanaCharacter) >= 35) {
          kanaCharacter.style.fontSize = "35vh";
          kanaCharacter.setAttribute("data-word-wraped", "false")
        }
        else if (isWraped) {
          kanaCharacter.style.fontSize = (90 / kanaCharacter.textContent.length) + "vw";
          kanaCharacter.setAttribute("data-word-wraped", "true")
        } else if (!isWraped & kanaCharacter.offsetHeight >= (lineHeightParsed * amountOfLinesTilAdjust)) {
          kanaCharacter.style.fontSize = (90 / kanaCharacter.textContent.length) + "vw";
          kanaCharacter.setAttribute("data-word-wraped", "true")
        }
      } catch (error) { }
    }

    // window.addEventListener('resize', onLineWrapDoSomething)

    //handles style changes on banner to check wrapping
    setInterval(onLineWrapDoSomething, 100)

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
      }, 300)
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
