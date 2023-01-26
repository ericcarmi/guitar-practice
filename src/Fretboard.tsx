import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Tunings from './tunings.json';
import { goldenRatio, Groups, Notes, NoteNumber, maxNumberOfStrings, minNumberOfStrings, 
	maxNumberOfFrets, minNumberOfFrets, allModes, GuitarString, NOTE,
} from './const';

const Modes = {
	lydian: [0, 2, 4, 6, 7, 9, 11],
	major: [0, 2, 4, 5, 7, 9, 11],
	ionian: [0, 2, 4, 5, 7, 9, 11],
	mixolydian: [0, 2, 4, 5, 7, 9, 10],
	dorian: [0, 2, 3, 5, 7, 9, 10],
	minor: [0, 2, 3, 5, 7, 8, 10],
	aeolian: [0, 2, 3, 5, 7, 8, 10],
	phyrgian: [0, 1, 3, 5, 7, 8, 10],
	locrian: [0, 1, 3, 4, 7, 8, 10],
}

const context = new AudioContext(); //allows access to webaudioapi
const osc = document.querySelector('#osc'); //grabs the button

const oscillator = context.createOscillator(); //creates oscillator

export const Fretboard = () => {

const onmousedown = (freq: number) => {
  // let oscPitch = document?.querySelector('#oscPitch')?.value; //assigning the value of the slider to a variable
oscillator.type = "sine"; //chooses the type of wave
oscillator.frequency.value = freq; //assigning the value of oscPitch to the oscillators frequency value
oscillator.connect(context.destination); //sends to output
oscillator.start(context.currentTime) //starts the sound at the current time
}
const onmouseup = () => {
  oscillator.disconnect() //disconnects the oscillator
}

	function getNextNote(x: string) {
		return Notes[(NoteNumber[x as keyof typeof NoteNumber] + 1) % 12]
	}

	function getPrevNote(x: string) {
		if (x === 'c') return 'b';
		return Notes[(NoteNumber[x as keyof typeof NoteNumber] - 1) % 12]
	}

	const [numFrets, setNumFrets] = useState(22);

	const [fretSize, setFretSize] = useState({ width: 70, height: 70 / goldenRatio })
	const [currentGroup, setCurrentGroup] = useState<keyof typeof Groups>('western 7');
	const [currentMode, setCurrentMode] = useState<keyof Object>('lydian' as keyof Object);
	const [currentRoot, setCurrentRoot] = useState<NOTE>('e');
	const [currentTuning, setCurrentTuning] = useState<keyof typeof Tunings>('standard8');
	const [fretOffColor, setFretOffColor] = useState('rgb(90,90,90)');
	const [fretOnColor, setFretOnColor] = useState('rgb(190,0,0)');

	const [strings, setStrings] = useState<Array<GuitarString>>(Tunings[currentTuning])
	const [numStrings, setNumStrings] = useState(Tunings[currentTuning].length);

	function getNotesFromMode() {
		let x = [];
		const offset = NoteNumber[currentRoot];
		for (let i in Groups[currentGroup][currentMode] ) {
			x.push(Notes[( Number(Groups[currentGroup][currentMode][i as keyof Object]) + offset) % 12]);
		}
		return x;
	}

	const notes = getNotesFromMode();

	return (
		<>
			<Header>
				<Button
					key={'s-'}
					onClick={() => {
						if (numStrings > minNumberOfStrings) {
							setNumStrings((prev) => prev - 1);
							setStrings((prev) => prev.slice(0, -1));
						}
					}}
				>
					S-
				</Button>
				<Button
					key={'s+'}
					onClick={() => {
						if (numStrings < maxNumberOfStrings) {
							setNumStrings((prev) => prev + 1);
							setStrings((prev) =>
								Tunings[currentTuning][numStrings - 1] !== undefined ?
									prev.concat(Tunings[currentTuning][numStrings])
									: prev.concat({ note: Notes[(NoteNumber[strings.slice(-1)[0].note as keyof typeof NoteNumber] + 5) % 12], position: numStrings + 1, octave: strings.slice(-1)[0].octave }));
						}
					}}
				>
					S+
				</Button>
				<Button
					key={'f-'}
					onClick={() => setNumFrets((prev) => Math.max(prev - 1, minNumberOfFrets))}
				>
					F-
				</Button>
				<Button
					key={'f+'}
					onClick={() => setNumFrets((prev) => Math.min(prev + 1, maxNumberOfFrets))}
				>
					F+
				</Button>


				<Dropdown
					value={currentTuning}
					onChange={(e) => {
						let t = e.target.value as keyof typeof Tunings
						setCurrentTuning(t);
						setStrings(Tunings[t].map((i) => i as GuitarString));
						setNumStrings(Tunings[t].length)
					}}
				>
					{Object.keys(Tunings).map((itm: any) => {
						return <option key={itm}>{itm}</option>
					})}

				</Dropdown>

				<Dropdown
					value={currentRoot}
					onChange={(e) => {
						setCurrentRoot(e.target.value as NOTE)
					}}
				>
					{Notes.map((itm: any) => {
						return <option key={itm}>{itm}</option>
					})}

				</Dropdown>


				<Dropdown
					value={currentMode}
					onChange={(e) => setCurrentMode(e.target.value as keyof Object)}
				>
					{Object.keys(Groups[currentGroup]).map((itm: any) => {
						return <option key={itm}>{itm}</option>
					})}

				</Dropdown>

				<Dropdown
					value={currentGroup}
					onChange={(e) => {
						setCurrentGroup(e.target.value as keyof typeof Groups);
						let x = Groups[e.target.value as keyof typeof Groups];
						setCurrentMode(Object.keys(x)[0] as keyof Object);

					}}
				>
					{Object.keys(Groups).map((itm: any) => {
						return <option key={itm}>{itm}</option>
					})}

				</Dropdown>


			</Header>


			<div style={{ position: 'absolute', top: '10%', left: '4%' }}>
				{strings.map((itm, idx) => {
					let a: any = []
					a.push(<div key={'t' + idx}>
						<TuneDownButton key={'t1' + idx} style={{ top: fretSize.height * idx + 10 }}
							onClick={() => {
								setStrings((prev) => prev.map((i) => i !== itm ? i : { note: getPrevNote(itm.note), position: itm.position, octave: itm.octave }))
							}}
						>-</TuneDownButton>
						<TuneUpButton key={'t2' + idx} style={{ top: fretSize.height * idx + 10 }}
							onClick={() => {
								setStrings((prev) => prev.map((i) => i !== itm ? i : { note: getNextNote(itm.note), position: itm.position, octave: itm.octave }))
							}}
						>+</TuneUpButton>
					</div>

					)

					for (let i = 0; i < numFrets; i++) {
						a.push(
							<Fret key={'f' + (i + idx * numStrings)} 
								onMouseDown={() => onmousedown && onmousedown(110 * Math.pow(2,i/12))}
								onMouseUp={() => onmouseup && onmouseup()}
								style={{
								left: fretSize.width * i,
								top: fretSize.height * idx,
								width: fretSize.width,
								height: fretSize.height,
								background: notes.includes(Notes[(i + NoteNumber[itm.note as keyof typeof NoteNumber]) % 12]) ? fretOnColor : fretOffColor,
							}}>
								{Notes[(i + NoteNumber[itm.note as keyof typeof NoteNumber]) % 12]}
							</Fret>
						)


					}
					if (idx === numStrings - 1) {
						for (let i = 0; i < numFrets; i++) {
							a.push(
								<FretNumber key={'n' + i + numStrings}
									style={{
										left: fretSize.width * i,
										top: 5 + fretSize.height * numStrings,
										width: fretSize.width,
										height: fretSize.height,
									}}>
									{i}
								</FretNumber>)


						}
					}

					return a;

				})}
			</div>
		</>
	);


}


const Header = styled.div((props) => {
	return {
		position: 'absolute',
		width: '100%',
		height: 50,
		background: 'linear-gradient(rgb(100,0,100), rgb(70,0,80))',
		textAlign: 'center',
		display: 'flex',
		alignContent: 'center',
		gap: '0px 5px',

	}
})

const Fret = styled.div`
// background: rgb(90,90,90);
text-align: center;
justify-content: center;
align-content: center;
padding: 2px;
position: absolute;
color: white;
cursor: pointer;
font-size: 20px;
line-height: calc(70px / ${goldenRatio});
vertical-align: middle;

	&:hover {
		filter: contrast(150%);		
	}
	&:active {
		filter: contrast(200%);		
	}
`

const FretNumber = styled.div`
background: rgb(0,90,0);
text-align: center;
justify-content: center;
align-content: center;
padding: 2px;
position: absolute;
color: white;
font-size: 20px;
line-height: 2em;
vertical-align: middle;
`

const Button = styled.div`
background: rgb(0,150,30);
width: 40px;
height: 50px;
text-align: center;
flex-direction: row;
cursor: pointer;
font-size: 20px;
line-height: 50px;

	&:hover {
		background: rgb(0,180,30);		
	}
	&:active {
		background: rgb(0,210,30);		
	}

`

const TuneDownButton = styled.div`
background: rgb(0,150,30);
color: black;
text-align: center;
position: absolute;
left: -62px;
width: 30px;
height: 20px;
cursor:pointer;

	&:hover {
		background: rgb(0,180,30);		
	}
	&:active {
		background: rgb(0,210,30);		
	}

`

const TuneUpButton = styled.div`
background: rgb(0,150,30);
color: black;
text-align: center;
position: absolute;
left: -30px;
width: 25px;
height: 20px;
cursor:pointer;

	&:hover {
		background: rgb(0,180,30);		
	}
	&:active {
		background: rgb(0,210,30);		
	}


`

const Dropdown = styled.select`
background: rgb(90,90,90);
text-align: center;
justify-content: center;
align-content: center;
color: white;
display: flex;
cursor: pointer;
font-size: 18px;
line-height: 2em;
vertical-align: middle;


	&:hover {
		background: rgb(130,130,130);		
	}
	&:active {
		background: rgb(170,170,170);		
	}

`




