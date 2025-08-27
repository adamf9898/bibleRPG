import React, { useEffect, useState } from 'react';

function App() {
  const [scripture, setScripture] = useState(null);

  useEffect(() => {
    fetch('/api/scripture')
      .then(res => res.json())
      .then(setScripture);
  }, []);

  return (
    <div style={{ padding: 32, fontFamily: 'serif' }}>
      <h1>Hear what The Spirit says</h1>
      <p>
        Welcome to an action, adventure, chaotic, open world, role playing, web game based on sharing The Gospel and scripture from The King James Version of The BIBLE.
      </p>
      <div style={{ margin: '2em 0', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Scripture of the Moment</h2>
        {scripture ? (
          <>
            <strong>{scripture.reference}</strong>
            <p>{scripture.text}</p>
          </>
        ) : (
          <em>Loading...</em>
        )}
      </div>
      {/* Game UI and logic will go here */}
    </div>
  );
}

export default App;
