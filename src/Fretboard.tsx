import React, { useState, useEffect } from 'react';
import styled from 'styled-components';





/*

fretboard consists of strings
a String object has a note (0th fret) and a position in the sequence of strings (high freq to low freq)
all strings share the same max fret
strings can be added or subtracted to the fretboard and they can be tuned
the rest of the fretboard is blocks, showing note letters for each



*/

// store note as note and octave pair, C4, as a string? or as a number?
// might not need to store position since it is pushed/popped?
type String = { note: string, position: number };

const Notes = ['c', 'u', 'd', 'v', 'e', 'f', 'x', 'g', 'y', 'a', 'z', 'b'];
const NoteNumber = { 'c': 0, 'u': 1, 'd': 2, 'v': 3, 'e': 4, 'f': 5, 'x': 6, 'g': 7, 'y': 8, 'a': 9, 'z': 10, 'b': 11 };

const defaultStrings = [
	{ note: "e4", position: 0 },
	{ note: "b3", position: 1 },
	{ note: "g3", position: 2 },
	{ note: "d3", position: 3 },
	{ note: "a2", position: 4 },
	{ note: "e2", position: 5 },
]
const maxNumberOfStrings = 12;
const minNumberOfStrings = 4;
const maxNumberOfFrets = 24;
const minNumberOfFrets = 12;

export const Fretboard = () => {


	const [strings, setStrings] = useState<Array<String>>(defaultStrings)
	const [numFrets, setNumFrets] = useState(15);
	const [numStrings, setNumStrings] = useState(strings.length);

	const [fretSize, setFretSize] = useState({ width: 70, height: 40 })

	return (
		<>
			<Button style={{ top: 'calc(10% - 25px)', left: '10%', }}
				onClick={() => {
					if (numStrings > minNumberOfStrings) {
						setNumStrings((prev) => prev - 1);
						setStrings((prev) => prev.slice(0, -1));
					}
				}}
			>
				S-
			</Button>
			<Button style={{ top: 'calc(10% - 25px)', left: 'calc(10% + 45px)', }}
				onClick={() => {
					if (numStrings < maxNumberOfStrings) {
						setNumStrings((prev) => prev + 1);
						setStrings((prev) => prev.concat({note: Notes[(NoteNumber[strings.slice(-1)[0].note[0] as keyof typeof NoteNumber] + 5) % 12] , position:numStrings + 1}));
					}
				}}
			>
				S+
			</Button>
			<Button style={{ top: 'calc(10% - 25px)', left: 'calc(10% + 90px)', }}
				onClick={() => setNumFrets((prev) => Math.max(prev - 1, minNumberOfFrets))}
			>
				F-
			</Button>
			<Button style={{ top: 'calc(10% - 25px)', left: 'calc(10% + 135px)', }}
				onClick={() => setNumFrets((prev) => Math.min(prev + 1, maxNumberOfFrets))}
			>
				F+
			</Button>
			<div style={{ position: 'absolute', top: '10%', left: '10%' }}>
				{strings.map((itm, idx) => {
					let a: any = []

					for (let i = 0; i < numFrets; i++) {
						a.push(
							<Fret key={(i + 1) * idx} style={{
								left: fretSize.width * i,
								top: fretSize.height * idx, width: fretSize.width, height: fretSize.height
							}}>
								{Notes[(i + NoteNumber[itm.note[0] as keyof typeof NoteNumber]) % 12]}
							</Fret>)


					}
					if (idx === numStrings - 1) {
						for (let i = 0; i < numFrets; i++) {
							a.push(
								<FretNumber key={(i + 1) * idx} style={{
									left: fretSize.width * i,
									top: 5 + fretSize.height * (idx + 1), 
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


const Fret = styled.div`
background: rgb(90,90,90);
text-align: center;
justify-content: center;
align-content: center;
padding: 2px;
position: absolute;
color: white;
cursor: pointer;

	&:hover {
		background: rgb(130,130,130);		
	}
	&:active {
		background: rgb(170,170,170);		
	}
`

const FretNumber = styled.div`
background: rgb(90,90,0);
text-align: center;
justify-content: center;
align-content: center;
padding: 2px;
position: absolute;
color: white;
`

const Button = styled.div`
background: rgb(0,150,30);
width: 40px;
height: 20px;
position: absolute;
text-align: center;
cursor: pointer;

	&:hover {
		background: rgb(0,180,30);		
	}
	&:active {
		background: rgb(0,210,30);		
	}

`




