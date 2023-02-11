import {useState} from 'react';
import {Fretboard} from './Fretboard';


function App() {

  const [isMouseDown, setIsMouseDown] = useState(false);

  
  return (
    <div 
      style={{
        userSelect: 'none', 
        background:'rgb(21,15,17)', 
        width: '100%',
        height: '100%', 
        position: 'absolute',
      }}
      onMouseDown={() => {setIsMouseDown(true)}}
      onMouseUp={() => setIsMouseDown(false)}
      >
    <Fretboard/>
    </div>
  );
}

export default App;
