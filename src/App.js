import {useState, useEffect, useRef} from 'react';
import {Fretboard} from './Fretboard';
import useScript from './hooks/useScript';

import * as Tone from 'tone'

function App() {

  const [isMouseDown, setIsMouseDown] = useState(false);

	// const audioContext = useRef(new AudioContext());
	// const oscillator = audioContext.current.createOscillator();
  
  
  return (
    <div 
      style={{
        userSelect: 'none', 
        background:'black', 
        width: '100%',
        height: '100%', 
        position: 'absolute'
      }}
      onMouseDown={() => {Tone.start(); setIsMouseDown(true)}}
      onMouseUp={() => setIsMouseDown(false)}
    
      >
    <Fretboard
      isMouseDown={isMouseDown}
    />
    </div>
  );
}

export default App;
