import React from 'react'
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
        "g": {
            "title": "が",
            "tags": ["dakuten_kana"],
            "characters": {
                "a": { "jp_character": "が", "romanji": ["ga"], "sound": "が" },
                "i": { "jp_character": "ぎ", "romanji": ["gi"], "sound": "ぎ" },
                . . .
            }
        }
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
  return (
    <div className='kana-group-elements'>
        <h2>{uppercaseFirstLetter(props.groupToShow)}</h2>
        <div className="character-title-group">

        <h3>Main Kana</h3>
        <div className="main-kana-characters">
        {Object.keys(kanaCharacters[props.groupToShow]).map((character) => {
            const { title, tags, characters } = kanaCharacters[props.groupToShow][character];
            const hasMainKanaTag = tags.includes("main_kana");

            if (hasMainKanaTag) {
                const characterText = Object.keys(characters).map((in_character) => {
                    const { romanji } = characters[in_character];
                    return romanji;
                }).join(" ");

                return (
                    <button className="character-title-element" key={character}>
                    <h3>{title}</h3>
                    <p>{characterText}</p>
                    </button>
                );
            }

            return null; // Skip characters without the "main_kana" tag
        })}
        </div>

        <h3>Dakuten Kana</h3>
        <div className="dakuten-kana-characters">
            {Object.keys(kanaCharacters[props.groupToShow]).map((character) => {
            const { title, tags, characters } = kanaCharacters[props.groupToShow][character];
            const hasDakutenKanaTag = tags.includes("dakuten_kana");

            if (hasDakutenKanaTag) {
                const characterText = Object.keys(characters).map((in_character) => {
                    const { romanji } = characters[in_character];
                    return romanji;
                }).join(" ");

                return (
                    <button className="character-title-element" key={character}>
                    <h3>{title}</h3>
                    <p>{characterText}</p>
                    </button>
                );
            }

            return null; // Skip characters without the "dakuten_kana" tag
            })}
        </div>
        </div>

    </div>

  )
}
