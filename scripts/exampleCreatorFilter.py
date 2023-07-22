import json

"""
This script was made to use a LLM to generate for us beginner words to use. 
The prompt used for the LLM is:

      Im creating a website for learning and practicing japanese Kana characters. 
      I need you to generate me a JSON file with the following structure:
      {
        "words": {
          "title": "words",
          "tags": [
            "main_kana"
          ],
          "characters": {
            "kawaii": {
              "jp_character": "かわいい",
              "romanji": [
                "kawaii"
              ],
              "sound": "かわいい",
              "meaning": "cute"
            },
            "jouzu": {
              "jp_character": "じょうず",
              "romanji": [
                "jouzu"
              ],
              "sound": "じょうず",
              "meaning": "skillful"
            }
          }
        }
      }
      Add 200 more beginner words that contain katakana and/or hiragana. 

The output will be in a format usable for the website
"""

# Character mappings  
char_mappings = {
  # Small versions of vowels
  'ぁ': 'あ',
  'ぃ': 'い',
  'ぅ': 'う', 
  'ぇ': 'え',
  'ぉ': 'お',

  # Small tsu
  'っ': 'つ', 
  
  # Small ya, yu, yo
  'ゃ': 'や',
  'ゅ': 'ゆ',
  'ょ': 'よ',

  # Small wa  
  'ゎ': 'わ',

  # Small ka, ke
  'ヵ': 'か',
  'ヶ': 'け'
}

# Load words JSON
with open('kana-words.json') as f:
  words = json.load(f)['words']['characters']  

# Load kana characters JSON
with open('kana-characters.json') as f:
  kana = json.load(f)

# Track unknown chars
unknown_chars = []

# Final output
output = {}

# Add kana group info to each word
for word, info in words.items():

  # Skip if kana or romaji already exists
  if info['jp_character'] in output or info['romanji'] in [w['romanji'] for w in output.values()]:
    continue
  
  # Get kana groups
  katakana_groups = []
  hiragana_groups = []
  
  has_unknown = False

  for char in info['jp_character']:

    # Check katakana 
    found = False 
    for data in kana['katakana'].values():
    
      if 'characters' in data:
      
        # Handle mappings only
        if char in char_mappings:
          char = char_mappings[char]
          
        # Only ignore ー for this char
        if char == 'ー':
          found = True
          break
            
        if char in [c['jp_character'] for c in data['characters'].values()]:
          katakana_groups.append(data['title'])
          found = True
          break
          
    # Check hiragana
    for data in kana['hiragana'].values():

      if 'characters' in data:
      
        # Handle mappings only
        if char in char_mappings:
          char = char_mappings[char]
          
        # Only ignore ー for this char  
        if char == 'ー':
          found = True
          break
            
        if char in [c['jp_character'] for c in data['characters'].values()]:
          hiragana_groups.append(data['title'])
          found = True
          break
          
    # Track unknown chars  
    if not found:
      unknown_chars.append((word, char))
      has_unknown = True
      
  # Add if no unknown chars
  if not has_unknown:
    output[word] = info
    output[word]['katakana_groups'] = list(set(katakana_groups))
    output[word]['hiragana_groups'] = list(set(hiragana_groups))
    
# Print unknown chars
print("Words with unknown characters:")  
for word, char in unknown_chars:
  print(f"{word}: {char}")
  
# Save output
with open('words_with_groups.json', 'w', encoding='utf-8') as f:
  json.dump(output, f, ensure_ascii=False)