// src/App.js
import React from 'react';
// import LockerControl from '../components/LockerControl';
import LockerControl from './components/LockerControl'; // ✅ correct casing

function App() {
  return (
    <div className="App">
      <LockerControl />
    </div>
  );
}

export default App;
