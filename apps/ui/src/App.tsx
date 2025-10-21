import './App.css';

import { useEffect, useState } from 'react';
import viteLogo from '/vite.svg';

import reactLogo from './assets/react.svg';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Demonstrate usage of the reputation algorithms library
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Reputo - Reputation Platform</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <div className="card">
        <h2>Available Reputation Algorithms</h2>
        <ul>
          <li>Algorithm 1</li>
          <li>Algorithm 2</li>
          <li>Algorithm 3</li>
        </ul>
      </div>

      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;
