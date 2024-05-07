// noinspection DuplicatedCode

navigator.requestMIDIAccess().then(init).catch(error);
let midi = null;
function error(error) {
	console.error("MIDI error: ", error.message)
}
function init(midiConnection) {
	let outputIterator = midiConnection.outputs.values();
	for(let output = outputIterator.next(); output && !output.done; output = outputIterator.next()) {
		let name = output.value.name;
		if(name && name.toLowerCase().includes("midi interface")) {
			midi = output;
		}
	}

	console.log("Found MIDI device: ", midi);
	osc.forEach(hookOscChange);
}

let osc = [500, 512, 524, 536];
midiReset();

setTimeout(() => {
	midi.value.send([0x90, 60, 64]);
}, 1000);
setTimeout(() => {
	midi.value.send([0x80, 60, 64]);
}, 2000);

setTimeout(() => {
	midi.value.send([0x90, 60, 64]);
	midi.value.send([0x91, 60, 64]);
	midi.value.send([0x92, 60, 64]);
	midi.value.send([0x93, 60, 64]);
}, 5000);

setTimeout(loop, 6000);

function loop() {
	osc[2] += 1;
	osc[3] -= 1;

	for(let i = 0; i < 4; i++) {
		if(osc[i] < 0) {
			osc[i] = 0;
		}
		else if(osc[i] > 1023) {
			osc[i] = 1023;
		}

		let midiPitchBendValue = map(osc[i], 0, 1023, 0, 16383);
		let lsb = midiPitchBendValue & 0x7F;
		let msb = (midiPitchBendValue >> 7) & 0x7F;

		midi.value.send([0xE0 + i, lsb, msb]);
	}

	setTimeout(loop, 100);
}

function midiReset() {
	for(let i = 0; i < 4; i++) {
		let midiPitchBendValue = map(osc[i], 0, 1023, 0, 16383);
		let lsb = midiPitchBendValue & 0x7F;
		let msb = (midiPitchBendValue >> 7) & 0x7F;

		midi.value.send([0xE0 + i, lsb, msb]);

		for(let note = 0; note < 128; note++) {
			midi.value.send([0x80 + i, note, 0]);
		}
	}
}

function map(value, start1, stop1, start2, stop2) {
	return (value - start1) * (stop2 - start2) / (stop1 - start1) + start2;
}
