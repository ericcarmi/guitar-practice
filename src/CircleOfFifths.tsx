import React, { useState, } from 'react';
import styled from 'styled-components';
import {Notes, NOTE, NoteNumber, synthType} from './const';

function relativeArc(section: number, theta: number, radius: number) {
	const numsteps = 100;
	const z = [];
	const slice = 1 / (1 + section);
	theta += Math.PI / 12;

	for (let i = 0; i <= numsteps; i++) {
		z.push([Math.cos(Math.PI * 2 * i / numsteps * slice), Math.sin(Math.PI * 2 * i / numsteps * slice)])
	}
	z.push([radius * Math.cos(Math.PI * 2 * slice), radius * Math.sin(Math.PI * 2 * slice)])
	for (let i = numsteps; i > 0; i--) {
		z.push([radius * Math.cos(Math.PI * 2 * i / numsteps * slice), radius * Math.sin(Math.PI * 2 * i / numsteps * slice)])
	}
	// z.push([r2,0])

	let x = z.map((i) => { return [i[0] * Math.cos(theta) - i[1] * Math.sin(theta), i[0] * Math.sin(theta) + i[1] * Math.cos(theta)] })
	// x = x.map((i) => { return [ i[0] + shift*Math.cos(theta), i[1] + shift*Math.sin(theta) ] })

	let s = '';
	for (let i in x) {
		s += (50 + x[i][0] * 100 / 2).toString() + "% " + (50 + x[i][1] * 100 / 2).toString() + "%, "
		// console.log(z[i])
	}
	// console.log(s.slice(0,-2));
	return s.slice(0, -2);
}

interface ICircleOfFifths {
	isMouseDown: boolean;
	currentRoot: string;
	currentMode: string;
	synth: synthType;
}

export const CircleOfFifths = ({
	isMouseDown,
	currentMode,
	currentRoot,
	synth,
}:ICircleOfFifths) => {

	const [hover, setHover] = useState(false);

	const convert = {'a':'a', 'b':'b', 'c':'c', 'd':'d', 'e':'e', 'f':'f', 'g':'g', 'u': 'db', 'v':'eb', 'x':'gb', 'y': 'ab', 'z' : 'bb'}

	const playTone = (note: string, octave: string) => {
		synth.triggerAttackRelease(convert[note as keyof typeof convert] + octave, "32n");
	}


	const outerPie = (isHovering: boolean, currentRoot: string) => {
		let a = []
		const shift = isHovering ? 10 : 0;
		let t = Math.PI / 6;
		const rad = 140;
		let x = -Math.PI / 2;

		const idx = NoteNumber[currentRoot as NOTE];
	
		for (let i = 0; i < 12; i++) {
			a.push(
				<div key={'wrap' + i}
					style={{fontSize: '18px'}}
					>
					<Slice
						key={'outer' + i}
						section={11}
						theta={Math.PI / 12 * 2 * i}
						radius={0.62}
						left={0 + shift * Math.cos(t + Math.PI / 12 * 2 * i)}
						top={0 + shift * Math.sin(t + Math.PI / 12 * 2 * i)}
						color={'radial-gradient(ellipse at center, rgb(100,100,100), rgb(40,40,40))'}
						onMouseDown={() => playTone(Notes[(4 + idx + i*7) % 12], '4')}
						onMouseEnter={() => {
							if(isMouseDown){
								playTone(Notes[(4 + idx + i*7) % 12], '4')
							}
						}}
					/>
					<Label
						left={`calc(150px + ${rad * Math.cos(x)}px - 1em * ${Math.abs(Math.cos(x/2))} )`}
						top={`calc(150px + ${rad * Math.sin(x)}px - 1em * ${Math.abs(Math.cos(x/2) + Math.sin(x/2))} )`}
						key={'outer label' + i}
					>
						{Notes[(idx + i*7) % 12]}
					</Label>
				</div>
			)
			x += Math.PI / 6;
		}
		return a;
	}

	const innerPie = (isHovering: boolean, currentRoot: string) => {
		let a = []
		const shift = isHovering ? 10 : 0;
		const t = Math.PI / 6;
		const idx = NoteNumber[currentRoot as NOTE];
		const rad = 80;
		let x = 0;

		for (let i = 0; i < 12; i++) {
			a.push(
				<div key={'inner key' + i}>
				<Slice
				key={'inner' + i}
				section={11}
				theta={Math.PI / 12 * 2 * i}
				radius={0.5}
				height={180}
				width={180}
				left={60 + shift * Math.cos(t + Math.PI / 12 * 2 * i)}
				top={60 + shift * Math.sin(t + Math.PI / 12 * 2 * i)}
				color={'radial-gradient(ellipse at center, rgb(0,100,0), rgb(40,40,40))'}
				onMouseDown={() => playTone(Notes[(idx + i*7 + 7) % 12], '3')}
				onMouseEnter={() => {
					if(isMouseDown){
						playTone(Notes[(4 + idx + i*7) % 12], '4')
					}
				}}
			/>
					<Label
						left={`calc(150px + ${rad * Math.cos(x)}px - 1em * ${Math.abs(Math.cos(x/2))} )`}
						top={`calc(150px + ${rad * Math.sin(x)}px - 1em * ${Math.abs(Math.cos(x/2) + Math.sin(x/2))} )`}
						key={'outer label' + i}
					>
						{Notes[(idx + i*7) % 12]}
					</Label>
			</div>
			)
				x+= Math.PI/6;
		}
		return a;
	}

	return (
		<Wrapper
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			{outerPie(hover, currentRoot)}
			{innerPie(hover, currentRoot)}

		</Wrapper>

	);
}

const Slice = styled.div<{ color: string; section: number, theta: number, radius: number, width?: number, height?: number, left: number, top: number }>((props) => {
	return {
		background: props.color,
		color: 'white',
		height: props.height !== undefined ? props.height : 300,
		width: props.width !== undefined ? props.width : 300,
		position: 'absolute',
		top: props.top,
		left: props.left,
		cursor: 'pointer',
		clipPath: `polygon(${relativeArc(props.section, props.theta, props.radius)})`,
		transition: 'filter 0.2s, top 0.4s, left 0.4s',
		'&:hover': {
			filter: 'contrast(150%)',
		},
		'&:active': {
			filter: 'contrast(190%)',
		}
	}
})

const Label = styled.span<{ left: number | string, top: number | string }>((props) => {
	return {
		position: 'absolute',
		top: props.top,
		left: props.left,
		textAlign: 'center',
		textTransform: 'uppercase',
		zIndex: 2,
		pointerEvents: 'none',

	}
})


const Wrapper = styled.div((props) => {
	return {
		width: 300,
		height: 300,
		position: 'absolute',
		background: 'transparent',
		top: 420,
		left: 100,
		borderRadius: 150,
		textAlign: 'center',

		// '&:hover *' : {
		// 	transform: 'translate(10px, 10px)'
		// }
	}
})

