import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Howl } from 'howler';
import Tunings from './tunings.json';
import { goldenRatio, Groups, Notes, NoteNumber, maxNumberOfStrings, minNumberOfStrings, 
	maxNumberOfFrets, minNumberOfFrets, allModes, GuitarString, NOTE, MODE,
} from './const';

import * as Tone from 'tone'



interface IFretboard {
	isMouseDown: boolean;
}


export const Fretboard = ({
	isMouseDown,
} : IFretboard) => {
	const synth = new Tone.Synth().toDestination();

	const playTone = (freq: number) => {
		synth.triggerAttackRelease(freq,  "32n");

	}

	function getNextNote(x: string) {
		return Notes[(NoteNumber[x as NOTE] + 1) % 12]
	}

	function getPrevNote(x: string) {
		if (x === 'c') return 'b';
		return Notes[(NoteNumber[x as NOTE] - 1) % 12]
	}

	const [numFrets, setNumFrets] = useState(22);

	const [fretSize, setFretSize] = useState({ width: 70, height: 70 / goldenRatio })

	const [currentGroup, setCurrentGroup] = useState<keyof typeof Groups>('western 7');
	const [currentMode, setCurrentMode] = useState<MODE>('lydian' as MODE);
	const [currentRoot, setCurrentRoot] = useState<NOTE>('e');
	const [currentTuning, setCurrentTuning] = useState<keyof typeof Tunings>('standard8');
	const [fretOffColor, setFretOffColor] = useState('rgb(90,90,90)');
	const [fretOnColor, setFretOnColor] = useState('rgb(190,0,0)');

	const [shouldOnlyPlayInMode,setShouldOnlyPlayInMode] = useState(true);

	const [strings, setStrings] = useState<Array<GuitarString>>(Tunings[currentTuning])
	const [numStrings, setNumStrings] = useState(Tunings[currentTuning].length);

	function getNotesFromMode() {
		let x = [];
		const offset = NoteNumber[currentRoot];
		for (let i in Groups[currentGroup][currentMode] ) {
			x.push(Notes[( Number(Groups[currentGroup][currentMode][i as MODE]) + offset) % 12]);
		}
		return x;
	}

	const notes = getNotesFromMode();

	const [interacted, setInteracted] = useState(false);


	// useEffect(() => {
	// 	const timeout = setTimeout(() => {
	// 		oscillator.disconnect();
	// 	},333);
	// 	return () => clearTimeout(timeout);
	// },[playTone, oscillator])

	function isInMode(i: number, itm: GuitarString){
		return notes.includes(Notes[(i + NoteNumber[itm.note as NOTE]) % 12])
	}

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
								Tunings[currentTuning][numStrings ] !== undefined ?
									prev.concat(Tunings[currentTuning][numStrings])
									: prev.concat({ note: Notes[(NoteNumber[strings.slice(-1)[0].note as NOTE] + 5) % 12], position: numStrings + 1, octave: strings.slice(-1)[0].octave }));
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
					onChange={(e) => setCurrentMode(e.target.value as MODE)}
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
						setCurrentMode(Object.keys(x)[0] as MODE);

					}}
				>
					{Object.keys(Groups).map((itm: any) => {
						return <option key={itm}>{itm}</option>
					})}

				</Dropdown>

				<ToggleButton 
					type="checkbox" 
					onChange={() => setShouldOnlyPlayInMode(prev => !prev)}
					checked={shouldOnlyPlayInMode}
					/>
					<ToggleLabel>only play in mode </ToggleLabel>


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
								onMouseEnter={() =>  {
									if(isMouseDown && shouldOnlyPlayInMode && isInMode(i, itm)) {
										playTone(27.5 * Math.pow(2,Number(itm.octave)) * Math.pow(2,(i + NoteNumber[itm.note as NOTE]) / 12))}
									}
								}
								onMouseDown={() =>  {
									playTone(27.5 * Math.pow(2,Number(itm.octave)) * Math.pow(2,(i + NoteNumber[itm.note as NOTE]) / 12))}
								}
								style={{
								left: fretSize.width * i,
								top: fretSize.height * idx,
								width: fretSize.width,
								height: fretSize.height,
								background: isInMode(i, itm) ? fretOnColor : fretOffColor,
							}}>
								{Notes[(i + NoteNumber[itm.note as NOTE]) % 12]}
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

const Template = styled.div((props) => {
	return {
	}
})


const ToggleButton = styled.input((props) => {
	return {
		color: 'white',
		background: 'black',
		
	}
})
const ToggleLabel = styled.span((props) => {
	return {
		color: 'white',
	}
})


const Header = styled.div((props) => {
	return {
		position: 'absolute',
		width: '100%',
		height: 50,
		background: 'linear-gradient(rgb(100,0,100), rgb(70,0,80))',
		textAlign: 'center',
		verticalAlign: 'center',
		lineHeight: '50px',
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




