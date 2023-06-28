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
        {character_button_group_builder(props,"main_kana")}

        <h3>Dakuten Kana</h3>
        {character_button_group_builder(props,"dakuten_kana")}

        </div>

    </div>

  )
}

function character_button_group_builder(props, tag) {
    return <div className={tag + "-characters"}>
        {Object.keys(kanaCharacters[props.groupToShow]).map((character) => {
            const { title, tags, characters } = kanaCharacters[props.groupToShow][character];
            const hasTag = tags.includes(tag);

            if (hasTag) {
                const characterText = Object.keys(characters).map((in_character) => {
                    const { romanji } = characters[in_character];
                    return romanji;
                }).join(" ");

                return (
                    <label className="character-checkbox-element" key={character}>
                        <input type="checkbox" id={title} className="character-checkbox-input" />
                        <div className="character-checkbox-content">
                            <h3>{title}</h3>
                            <p>{characterText}</p>
                        </div>
                    </label>
                );
            }

            return null; // Skip characters without the tag
        })}
    </div>;
}

