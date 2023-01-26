
export const goldenRatio = (1 + Math.sqrt(5)) / 2.0;
export const Notes = ['c', 'u', 'd', 'v', 'e', 'f', 'x', 'g', 'y', 'a', 'z', 'b'];
export const NoteNumber = { 'c': 0, 'u': 1, 'd': 2, 'v': 3, 'e': 4, 'f': 5, 'x': 6, 'g': 7, 'y': 8, 'a': 9, 'z': 10, 'b': 11 };
export const maxNumberOfStrings = 12;
export const minNumberOfStrings = 4;
export const maxNumberOfFrets = 24;
export const minNumberOfFrets = 2;


export const Groups = {
	'western 7' : {
		lydian : [0, 2, 4, 6, 7, 9, 11],
		major : [0, 2, 4, 5, 7, 9, 11],
		ionian : [0, 2, 4, 5, 7, 9, 11],
		mixolydian : [0, 2, 4, 5, 7, 9, 10],
		dorian : [0, 2, 3, 5, 7, 9, 10],
		minor : [0, 2, 3, 5, 7, 8, 10],
		aeolian : [0, 2, 3, 5, 7, 8, 10],
		phyrgian : [0, 1, 3, 5, 7, 8, 10],
		locrian : [0, 1, 3, 4, 7, 8, 10],
	},
	'diminished' : {
		a : [0, 1, 3, 4, 6, 7, 9, 10], 
		b : [0, 2, 3, 5, 6, 8, 9, 11]
	}
}

export type allModes = 
	|	"lydian"
	|	"major"
	|	"ionian"
	|	"mixolydian"
	|	"dorian"
	|	"minor"
	|	"aeolian"
	|	"phyrgian"
	|	"locrian"
	|	"a"
	|	"b";

// should be a better way to do a union when they already exist
// iterate through 

// const x = Object.keys(Groups).map((i) => Object.keys(Groups[i as keyof typeof Groups])).flat();

// let a = "";
// for( let i in x) {
// 	console.log(i);
// }
// console.log( x)
