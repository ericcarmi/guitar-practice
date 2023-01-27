import {Fretboard} from './Fretboard';
import {useState, useEffect} from 'react';


function App() {

  const [isMouseDown, setIsMouseDown] = useState(false);

  
  
  return (
    <div 
      style={{
        userSelect: 'none', 
        background:'black', 
        width: '100%',
        height: '100%', 
        position: 'absolute'
      }}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      >
    <Fretboard
    isMouseDown={isMouseDown}
    setIsMouseDown={setIsMouseDown}
    />
    </div>
  );
}

export default App;
