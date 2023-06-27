import React from 'react'
import { kanaCharacters } from '../kanaCharacters.js'

/*
Structure of kanaCharacters:
{
    "hiragana": {
        "a" {
            "title": "あ",
            "characters": {
                "a": { "jp_character": "あ", "romanji": ["a"], "sound": "あ" },
                "i": { "jp_character": "い", "romanji": ["i"], "sound": "い" },
                . . .
            }
        },
        "k": {
            "title": "か",
            "characters": {
                "a": { "jp_character": "か", "romanji": ["ka"], "sound": "か" },
                "i": { "jp_character": "き", "romanji": ["ki"], "sound": "き" },
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
    <div>
        <h2>{uppercaseFirstLetter(props.groupToShow)}</h2>
        <div className="character-title-group">
            {Object.keys(kanaCharacters[props.groupToShow]).map((character) => {
                return (
                    <div className="character-title-element">
                        <h3>{kanaCharacters[props.groupToShow][character].title}</h3>
                        <p>
                            {Object.keys(kanaCharacters[props.groupToShow][character].characters).map((in_character) => {
                                return kanaCharacters[props.groupToShow][character].characters[in_character].romanji + " "
                            })}
                        </p>
                    </div>
            )})}
        </div>

    </div>

  )
}
