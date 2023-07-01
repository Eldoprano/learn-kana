import React from 'react'

export default function InGameWriteAnswer() {

  function handleKeyDown(e) {
    // Check if key is a printable character and append it to the input field
    if (e.key.match(/^[A-Za-z0-9 ]+$/) && e.key.length === 1) {
      document.querySelector('#in-game-text-input-cursor-group span').textContent += e.key;
    } else if (e.key === 'Enter') {
      document.querySelector('#in-game-text-input-cursor-group span').textContent += '\n';
    } else if (e.key === 'Backspace') {
      document.querySelector('#in-game-text-input-cursor-group span').textContent = document.querySelector('#in-game-text-input-cursor-group span').textContent.slice(0, -1);
    }
  }

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
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    window.addEventListener('load', handleFocus);
    return () => {
      window.removeEventListener("load", handleFocus);
    };
  }, []);



  return (
    <>
      <div id='in-game-text-input-cursor-group'>
        <span></span>
        <div id='in-game-text-input-cursor'></div>
      </div>
      <input type="text" id='in-game-text-input' />
      <p id="hidden-text-for-font-loading">a</p>
    </>
  )
}
