import React, { useState, useRef } from 'react';
import { kanaCharacters } from '../kanaCharacters.js'


/*
Structure of kanaCharacters:
{
    "hiragana": {
        "a" {
            "title": "あ",
            "tags": ["main_kana"],
            "characters": {
                "a": { "jp_character": "あ", "romanji": ["a"], "sound": "あ" },
                "i": { "jp_character": "い", "romanji": ["i"], "sound": "い" },
                . . .
            }
        }, . . .
    },
    "katakana": {
        . . .
    }
}
*/

function uppercaseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


export default function KanaGroup(props) {
  const [mainKanaSelected, setMainKanaSelected] = useState(false);
  const [dakutenKanaSelected, setDakutenKanaSelected] = useState(false);
  const groupRef = useRef(null);

  const toggleSelectAll = (tag) => {
    if (tag === "main_kana") {
      setMainKanaSelected(!mainKanaSelected);
      toggleCheckboxes("main_kana", !mainKanaSelected);
    } else if (tag === "dakuten_kana") {
      setDakutenKanaSelected(!dakutenKanaSelected);
      toggleCheckboxes("dakuten_kana", !dakutenKanaSelected);
    }
  };

  const toggleCheckboxes = (tag, isChecked) => {
    const checkboxes = groupRef.current.querySelectorAll(`.${tag}-characters .kana-checkbox`);
    checkboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
      // Update localStorage accordingly
      const title = checkbox.id;
      let checkedKanas = JSON.parse(localStorage.getItem('checkedKanas')) || [];
      if (isChecked) {
        if (!checkedKanas.includes(title)) {
          checkedKanas.push(title);
        }
      } else {
        checkedKanas = checkedKanas.filter(item => item !== title);
      }
      localStorage.setItem('checkedKanas', JSON.stringify(checkedKanas));
    });
  };

  return (
    <div className='kana-group-elements' ref={groupRef}>
      <h2>{uppercaseFirstLetter(props.groupToShow)}</h2>
      <div className="character-title-group">
        <div className={`character-title-group-button ${mainKanaSelected ? 'selected' : ''}`} 
             onClick={() => toggleSelectAll("main_kana")}>
          <h3>Main Kana</h3>
        </div>
        {character_button_group_builder(props, "main_kana")}

        <div className={`character-title-group-button ${dakutenKanaSelected ? 'selected' : ''}`} 
             onClick={() => toggleSelectAll("dakuten_kana")}>
          <h3>Dakuten Kana</h3>
        </div>
        {character_button_group_builder(props, "dakuten_kana")}
      </div>
    </div>
  );
}

function character_button_group_builder(props, tag) {
  return (
    <div className={tag + "-characters"}>
      {Object.keys(kanaCharacters[props.groupToShow]).map((character) => {
        const { title, tags, characters } = kanaCharacters[props.groupToShow][character];
        const hasTag = tags.includes(tag);

        if (hasTag) {
          const characterText = Object.keys(characters).map((in_character) => {
            const { romanji } = characters[in_character];
            return romanji;
          }).join(" ");

          // checkedKanas in local storage is a list of kanas that should be checked
          return (
            <label className="character-checkbox-element" key={character}>
              <input type="checkbox"
                defaultChecked={localStorage.checkedKanas.includes(title)}
                id={title}
                className="character-checkbox-input kana-checkbox" />
              <div className="character-checkbox-content">
                <h3>{title}</h3>
                <p>{characterText}</p>
              </div>
            </label>
          );
        }

        return null; // Skip characters without the tag
      })}
    </div>
  );
}