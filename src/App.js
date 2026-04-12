import React from 'react';
import TitlePage from './components/TitlePage';
import GameMenu from './components/GameMenu';
import FontPreloader from './components/FontPreloader';

function App() {
// Type rfc to create a react component
  return (
    <>
      <FontPreloader />
      <TitlePage />
      <GameMenu />
    </>
  );
}

export default App;
