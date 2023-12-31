import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Howl } from 'howler';
import Tunings from './tunings.json';
import {
	goldenRatio, Groups, Notes, NoteNumber, maxNumberOfStrings, minNumberOfStrings,
	maxNumberOfFrets, minNumberOfFrets, allModes, GuitarString, NOTE, MODE, synthType,
	Ternary,
} from './const';
import { SketchPicker, PhotoshopPicker } from 'react-color';

import * as Tone from 'tone'

import { CircleOfFifths, CFSIZE } from './CircleOfFifths';


interface IFretboard {
	isMouseDown: boolean;
}



export const Fretboard = ({
	isMouseDown,
}: IFretboard) => {
	const [synth, setSynth] = useState<synthType>(new Tone.AMSynth().toDestination());

	const playTone = (freq: number) => {
		synth.triggerAttackRelease(freq, "32n");
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
	const [shouldUseNumbers, setShouldUseNumbers] = useState<Ternary>(false);
	const [currentTuning, setCurrentTuning] = useState<keyof typeof Tunings>('standard8');
	const [fretOffColor, setFretOffColor] = useState('radial-gradient(ellipse at center, rgb(90,90,90), rgb(30,30,30))');
	const [fretOnColor, setFretOnColor] = useState('radial-gradient(ellipse at center, rgb(0,0,190), rgb(30,30,30))');
	const [fretSelectedColor, setFretSelectedColor] = useState('radial-gradient(ellipse at center, rgb(0,190,0), rgb(30,30,30))');

	const [shouldOnlyPlayInMode, setShouldOnlyPlayInMode] = useState(true);

	const [notesForLoop, setNotesForLoop] = useState<Array<number>>([]);
	const [selectedFrets, setSelectedFrets] = useState<Array<number>>([]);

	const [strings, setStrings] = useState<Array<GuitarString>>(Tunings[currentTuning])
	const [numStrings, setNumStrings] = useState(Tunings[currentTuning].length);

	const [showColorDropdown, setShowColorDropdown] = useState(false);


	const [seq, setSeq] = useState(new Tone.Sequence);
	const [BPM, setBPM] = useState(111);



	function getNotesFromMode() {
		let x = [];
		const offset = NoteNumber[currentRoot];
		for (let i in Groups[currentGroup][currentMode]) {
			x.push(Notes[(Number(Groups[currentGroup][currentMode][i as MODE]) + offset) % 12]);
		}
		return x;
	}

	const notes = getNotesFromMode();

	// useEffect(() => {
	// 	const timeout = setTimeout(() => {
	// 		oscillator.disconnect();
	// 	},333);
	// 	return () => clearTimeout(timeout);
	// },[playTone, oscillator])

	function isInMode(i: number, itm: GuitarString) {
		return notes.includes(Notes[(i + NoteNumber[itm.note as NOTE]) % 12])
	}


	function stringToFreq(itm: GuitarString, fret: number) {
		return 27.5 * Math.pow(2, Number(itm.octave)) * Math.pow(2, (3 + fret + NoteNumber[itm.note as NOTE]) / 12)
	}

	function clickFretNumber(fret: number) {
		let x: Array<number> = [];
		strings.map((itm, idx) => {
			x.push(stringToFreq(itm, fret));
		})
		const seq = new Tone.Sequence((time, note) => {
			synth.triggerAttackRelease(note, 0.1, time);
			// subdivisions are given as subarrays
		}, x);

		seq.start(seq.now() + 0);

		Tone.Transport.start();

	}

	useEffect(() => {
		// this shouldn't change too fast
		// Tone.Transport.bpm.value = BPM;
		Tone.Transport.bpm.rampTo(BPM, 0.2);
	}, [BPM, setBPM])



	function startLoop() {
		setSeq(new Tone.Sequence((time, note) => {
			synth.triggerAttackRelease(note, 0.01, time);
			// subdivisions are given as subarrays
			// }, ['c4', 'e3', ['d3', 'a3'], 'b3']).start();
		}, notesForLoop).start(0));
		Tone.Transport.start();

	}

	function updateLoop() {
		setSeq(new Tone.Sequence((time, note) => {
			synth.triggerAttackRelease(note, 0.01, time);
		}, notesForLoop).start(0));

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
								Tunings[currentTuning][numStrings] !== undefined ?
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
					value={shouldUseNumbers === false ? 'num' : shouldUseNumbers === undefined ? 'a/#' : 'abc'}
					onChange={(e) => {
						setShouldUseNumbers(prev => e.target.value === 'a/#' ? undefined : !prev)
					}}
				>
					{(['abc', 'num', 'a/#']).map((itm: any) => {
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

				<Dropdown
					value={synth.name}
					onChange={(e) => {
						switch (e.target.value) {
							case "AMSynth": {
								setSynth(new Tone.AMSynth().toDestination());
								break;
							}
							case "FMSynth": {
								setSynth(new Tone.FMSynth().toDestination());
								break;
							}
							case "PolySynth": {
								setSynth(new Tone.PolySynth().toDestination());
								break;
							}
							case "Synth": {
								setSynth(new Tone.Synth().toDestination());
								break;
							}
						}
					}}
				>
					{Object(['AMSynth', 'FMSynth', 'PolySynth', 'Synth']).map((itm: any) => {
						return <option key={itm}>{itm}</option>
					})}

				</Dropdown>

				<ToggleButton
					type="checkbox"
					onChange={() => setShouldOnlyPlayInMode(prev => !prev)}
					checked={shouldOnlyPlayInMode}
				/>
				<ToggleLabel>only play in mode </ToggleLabel>


				<Button
					onClick={() => {
						console.log(Tone.Transport.state)
						if (Tone.Transport.state === 'started') {
							Tone.Transport.stop();
							seq.stop();
						}
						else {
							startLoop();
						}
					}}
					style={{ width: 'max-content', padding: '0px 5px 0px 5px' }}
				>
					{Tone.Transport.state === 'started' ? 'stop loop' : 'play loop'}
				</Button>

				<BPMSlider type='range' min='30' max='300' value={BPM}
					onChange={(e) => { setBPM(Number(e.target.value)) }}
				/>



				{/*
				<Dropdown
					onClick={() => setShowColorDropdown(prev => !prev)}
					onChange={(e) => {

					}}
				>
					<option hidden key={'edit colors'}>{'edit colors'}</option>
					{Object(['fret off color', 'fret on color', 'fret number color', 'button color']).map((itm: any) => {
						return <option key={itm}>{itm}</option>
					})}

				</Dropdown> 
				*/}

				{showColorDropdown &&
					<div style={{ position: 'relative', zIndex: 3 }}>
						<PhotoshopPicker
							color={fretOffColor}
							onAccept={(e) => { setFretOffColor(`radial-gradient(ellipse at center, ${e.hex}, rgb(30,30,30))`); setShowColorDropdown(false) }}
							onChangeComplete={(e) => setFretOffColor(`radial-gradient(ellipse at center, ${e.hex}, rgb(30,30,30))`)}

						/>
					</div>}



			</Header>


			<div style={{ position: 'relative', top: '10%', display: 'flex', justifyContent: 'center' }}>
				<div
					style={{position: 'absolute', left: '5%'}}
				>
					{strings.map((itm, idx) => {
						let a: any = []
						a.push(
							<div key={'t' + idx}>
								<span style={{zIndex: 3, position: 'absolute', top: fretSize.height * idx + fretSize.height / 4, left: -10, fontSize: '15px', color: 'white'}}>{itm.note}</span>
								<TuneDownButton key={'t1' + idx} style={{ top: fretSize.height * idx + 22 }}
									onClick={() => {
										setStrings((prev) => prev.map((i) => i !== itm ? i : { note: getPrevNote(itm.note), position: itm.position, octave: itm.octave }))
									}}
								>-</TuneDownButton>
								<TuneUpButton key={'t2' + idx} style={{ top: fretSize.height * idx + 2 }}
									onClick={() => {
										setStrings((prev) => prev.map((i) => i !== itm ? i : { note: getNextNote(itm.note), position: itm.position, octave: itm.octave }))
									}}
								>+</TuneUpButton>
							</div>

						)

						for (let i = 0; i < numFrets; i++) {
							a.push(
								<Fret key={i + idx * numFrets}
									onMouseEnter={(e) => {
										if (!e.shiftKey && isMouseDown && shouldOnlyPlayInMode && isInMode(i, itm)) {
											playTone(stringToFreq(itm, i))
										}
									}
									}
									onMouseDown={(e) => {
										if (e.shiftKey) {
											setNotesForLoop(prev => [...prev, stringToFreq(itm, i)]);
											setSelectedFrets(prev => [...prev, i + idx * numFrets]);
											updateLoop();
										}
										else if (e.altKey) {
											setNotesForLoop(prev => prev.filter((num) => num !== stringToFreq(itm, i)));
											setSelectedFrets(prev => prev.filter((fret) => fret !== i + idx * numFrets));
											updateLoop();

										}
										else {
											playTone(stringToFreq(itm, i))
										}
									}
									}
									style={{
										left: fretSize.width * i,
										top: fretSize.height * idx,
										width: fretSize.width,
										height: fretSize.height,
										background: selectedFrets.includes(i + idx * numFrets) ? fretSelectedColor :
											isInMode(i, itm) ? fretOnColor : fretOffColor,
									}}>
									{shouldUseNumbers ? Notes[(i + NoteNumber[itm.note as NOTE]) % 12]
										: shouldUseNumbers === false ? (i + NoteNumber[itm.note as NOTE] - NoteNumber[currentRoot] + 12) % 12
											: Notes[(i + NoteNumber[itm.note as NOTE]) % 12]
											+ " " + (i + NoteNumber[itm.note as NOTE] - NoteNumber[currentRoot] + 12) % 12
									}
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
										}}
										onClick={() => clickFretNumber(i)}
									>
										{i}
									</FretNumber>)
							}
						}

						return a;

					})}

				</div>

				<CircleOfFifths
					isMouseDown={isMouseDown}
					currentMode={currentMode}
					currentRoot={currentRoot}
					synth={synth}
				/>
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
		color: 'rgb(125,50,20)',
	}
})


const BPMSlider = styled.input((props) => {
	return {
		background: 'red',
		color: 'green',
	}
})


const Header = styled.div((props) => {
	return {
		position: 'absolute',
		width: '100%',
		height: 50,
		background: 'rgb(170,170,170)',
		textAlign: 'center',
		verticalAlign: 'center',
		lineHeight: '50px',
		display: 'flex',
		alignContent: 'center',
		gap: '0px 2px',
		zIndex: 2,

	}
})

const Fret = styled.div`
// background: rgb(90,90,90);
text-align: center;
justify-content: center;
align-content: center;
padding: 2px;
position: absolute;
color: rgb(230,200,200);
text-transform: uppercase;
cursor: pointer;
font-size: 20px;
line-height: calc(70px / ${goldenRatio});
vertical-align: middle;
transition: filter 0.2s;

	&:hover {
		filter: contrast(120%);		
	}
	&:active {
		filter: contrast(150%);		
	}
`

const FretNumber = styled.div`
background: rgb(0,90,0);
text-align: center;
justify-content: center;
align-content: center;
padding: 2px;
position: absolute;
color: rgb(230,200,200);
font-size: 20px;
line-height: 2em;
vertical-align: middle;
background: rgb(70,70,70);
cursor: pointer;
`

// for string +/- and fret +/-
const Button = styled.div`
background: rgb(0,100,0);
width: 50px;
text-align: center;
flex-direction: row;
cursor: pointer;
font-size: 20px;
line-height: 50px;
transition: filter 0.2s;
color: rgb(230,200,200);

	&:hover {
		filter: contrast(120%);		
	}
	&:active {
		filter: contrast(150%);		
	}



`

const TuneDownButton = styled.div`
background: rgb(0,100,0);
color: black;
text-align: center;
position: absolute;
left: -43px;
color: rgb(230,200,200);
width: 30px;
height: 18px;
margin-top: 2px;
cursor:pointer;
transition: filter 0.2s;


	&:hover {
		filter: contrast(120%);		
	}
	&:active {
		filter: contrast(150%);		
	}

`

const TuneUpButton = styled.div`
background: rgb(0,100,0);
color: black;
text-align: center;
position: absolute;
color: rgb(230,200,200);
left: -43px;
width: 30px;
height: 18px;
margin-bottom: 2px;
cursor:pointer;
transition: filter 0.2s;


	&:hover {
		filter: contrast(120%);		
	}
	&:active {
		filter: contrast(150%);		
	}


`

const Dropdown = styled.select`
background: rgb(30,30,30);
text-align: center;
justify-content: center;
align-content: center;
color: rgb(230,200,200);
display: flex;
cursor: pointer;
font-size: 18px;
line-height: 2em;
vertical-align: middle;
transition: filter 0.2s;

	&:hover {
		filter: contrast(120%);		
	}
	&:active {
		filter: contrast(150%);		
	}

`




