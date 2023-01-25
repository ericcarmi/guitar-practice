import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Tunings from './tunings.json';


const Modes = {
	lydian : [0, 2, 4, 6, 7, 9, 11],
	major : [0, 2, 4, 5, 7, 9, 11],
	ionian : [0, 2, 4, 5, 7, 9, 11],
	mixolydian : [0, 2, 4, 5, 7, 9, 10],
	dorian : [0, 2, 3, 5, 7, 9, 10],
	minor : [0, 2, 3, 5, 7, 8, 10],
	aeolian : [0, 2, 3, 5, 7, 8, 10],
	phyrgian : [0, 1, 3, 5, 7, 8, 10],
	locrian : [0, 1, 3, 4, 7, 8, 10],
}

function loadTunings() {
	
}

const goldenRatio = (1 + Math.sqrt(5)) / 2.0;

/*

fretboard consists of strings
a String object has a note (0th fret) and a position in the sequence of strings (high freq to low freq)
all strings share the same max fret
strings can be added or subtracted to the fretboard and they can be tuned
the rest of the fretboard is blocks, showing note letters for each



*/

// store note as note and octave pair, C4, as a string? or as a number?
// might not need to store position since it is pushed/popped?
// should add octave...

type GuitarString = { note: string, position: number, octave: string };

const Notes = ['c', 'u', 'd', 'v', 'e', 'f', 'x', 'g', 'y', 'a', 'z', 'b'];
const NoteNumber = { 'c': 0, 'u': 1, 'd': 2, 'v': 3, 'e': 4, 'f': 5, 'x': 6, 'g': 7, 'y': 8, 'a': 9, 'z': 10, 'b': 11 };

const defaultStrings = [
	{ note: "e", octave: '4', position: 0 },
	{ note: "b", octave: '3', position: 1 },
	{ note: "g", octave: '3', position: 2 },
	{ note: "d", octave: '3', position: 3 },
	{ note: "a", octave: '2', position: 4 },
	{ note: "e", octave: '2', position: 5 },
]
const maxNumberOfStrings = 12;
const minNumberOfStrings = 4;
const maxNumberOfFrets = 24;
const minNumberOfFrets = 2;

export const Fretboard = () => {

	function getNextNote(x: string){
		return Notes[(NoteNumber[x as keyof typeof NoteNumber] + 1) % 12]		
	}

	function getPrevNote(x: string){
		if (x === 'c') return 'b';
		return Notes[(NoteNumber[x as keyof typeof NoteNumber] - 1) % 12]		
	}

	const [strings, setStrings] = useState<Array<GuitarString>>(defaultStrings)
	const [numFrets, setNumFrets] = useState(15);
	const [numStrings, setNumStrings] = useState(strings.length);

	const [fretSize, setFretSize] = useState({ width: 70, height: 70 / goldenRatio  })
	const [currentMode, setCurrentMode] = useState<keyof typeof Modes >('major');
	const [currentRoot, setCurrentRoot] = useState<keyof typeof NoteNumber>('e');
	const [currentTuning, setCurrentTuning] = useState<keyof typeof Tunings>('standard');
	const [fretOffColor, setFretOffColor] = useState('rgb(90,90,90)');
	const [fretOnColor, setFretOnColor] = useState('rgb(190,0,0)');

	function getNotesFromMode() {
		let x = [];
		const offset = NoteNumber[currentRoot];
		for(let i in Modes[currentMode]){
			x.push(Notes[(Modes[currentMode][i] + offset) % 12]);
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
						setStrings((prev) => prev.concat({ note: Notes[(NoteNumber[strings.slice(-1)[0].note as keyof typeof NoteNumber] + 5) % 12], position: numStrings + 1, octave: strings.slice(-1)[0].octave }));
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
				value={currentMode}
				onChange={(e) => setCurrentMode(e.target.value as keyof typeof Modes )}
				>
				{Object.keys(Modes).map((itm:any) => {
					return <option key={itm}>{itm}</option>
				})}

			</Dropdown>

			<Dropdown
				value={currentTuning}
				onChange={(e) => {
						setCurrentTuning(e.target.value as keyof typeof Tunings);
						setStrings(Tunings[e.target.value as keyof typeof Tunings].map((i) => i as GuitarString));
					}}
				>
				{Object.keys(Tunings).map((itm:any) => {
					return <option key={itm}>{itm}</option>
				})}

			</Dropdown>


			</Header>

			
			<div style={{ position: 'absolute', top: '10%', left: '4%' }}>
				{strings.map((itm, idx) => {
					let a: any = []
					a.push(<div key={'t' + idx}>
						<TuneDownButton key={'t1' + idx} style={{top: fretSize.height * idx + 10}}
							onClick={() => {
								setStrings((prev) => prev.map((i) => i !== itm ? i : {note:getPrevNote(itm.note), position:itm.position, octave: itm.octave}))
							}}
							>-</TuneDownButton>
						<TuneUpButton key={'t2' + idx} style={{top: fretSize.height * idx + 10}}
							onClick={() => {
								setStrings((prev) => prev.map((i) => i !== itm ? i : {note:getNextNote(itm.note), position:itm.position, octave: itm.octave}))
							}}
							>+</TuneUpButton>
					</div>

					)

					for (let i = 0; i < numFrets; i++) {
						a.push(
							<Fret key={'f' + (i + idx*numStrings)} style={{
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
								<FretNumber key={'n' + i+numStrings} 
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




