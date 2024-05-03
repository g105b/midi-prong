navigator.requestMIDIAccess().then(init).catch(error);
let midi = null;
let learnChan = 0;
let osc = [
	document.querySelector("[name='osc[0]']"),
	document.querySelector("[name='osc[1]']"),
	document.querySelector("[name='osc[2]']"),
	document.querySelector("[name='osc[3]']"),
];
let registerSelect = document.querySelector("[name=register]");
registerSelect.addEventListener("change", loadRegister);
let registers = localStorage.getItem("prong");
if(registers) {
	registers = JSON.parse(registers);
}
else {
	registers = [];
}
let prongSlider = document.querySelector("input[name=prong]");
prongSlider.addEventListener("input", prongChange);
let pingPong = false;

drawSelect();

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

function hookOscChange(o) {
	o.addEventListener("input", oscChange);
}

function oscChange(o) {
	midi.value.send([0xE1, ...bend(osc[0].value)]);
	midi.value.send([0xE2, ...bend(osc[1].value)]);
	midi.value.send([0xE3, ...bend(osc[2].value)]);
	midi.value.send([0xE4, ...bend(osc[3].value)]);
}

document.querySelector("button[value=set]").addEventListener("click", set);
document.querySelector("button[value=clr]").addEventListener("click", clear);
document.querySelector("button[value=start]").addEventListener("click", start);
document.querySelector("button[value=stop]").addEventListener("click", stop);
document.querySelector("button[value=learn]").addEventListener("click", learn);

function set(e) {
	registers.push([
		osc[0].value,
		osc[1].value,
		osc[2].value,
		osc[3].value,
	]);
	localStorage.setItem("prong", JSON.stringify(registers));
	drawSelect(true);
}

function clear(e) {
	registers = [];
	localStorage.removeItem("prong");
	drawSelect();
	osc[0].value = 0;
	osc[1].value = 0;
	osc[2].value = 0;
	osc[3].value = 0;
}

function learn(e) {
	midi.value.send([0x91 + learnChan, 60, 127]);
	midi.value.send([0x81 + learnChan, 60, 127], window.performance.now() + 1);
	learnChan++;
	if(learnChan >= 4) {
		learnChan = 0;
	}
}

function start(e) {
	midi.value.send([0x91, 60, 105]);
	midi.value.send([0x92, 61, 105], window.performance.now() + 500);
	midi.value.send([0x93, 62, 105], window.performance.now() + 1000);
	midi.value.send([0x94, 63, 105], window.performance.now() + 1500);
	midi.value.send([0xE1, ...bend(osc[0].value)]);
	midi.value.send([0xE2, ...bend(osc[1].value)]);
	midi.value.send([0xE3, ...bend(osc[2].value)]);
	midi.value.send([0xE4, ...bend(osc[3].value)]);
}

function stop(e) {
	midi.value.send([0xB0, 123, 0]);
	midi.value.send([0xB1, 123, 0]);
	midi.value.send([0xB2, 123, 0]);
	midi.value.send([0xB3, 123, 0]);
	midi.value.send([0xB4, 123, 0]);

	midi.value.send([0xB0, 120, 0]);
	midi.value.send([0xB1, 120, 0]);
	midi.value.send([0xB2, 120, 0]);
	midi.value.send([0xB3, 120, 0]);
	midi.value.send([0xB4, 120, 0]);

	midi.value.send([0x81, 60, 127]);
	midi.value.send([0x82, 60, 127]);
	midi.value.send([0x83, 60, 127]);
	midi.value.send([0x84, 60, 127]);

	for (let channel = 0; channel <= 0xF; channel++) { // From channel 0 to 15 (0x0 to 0xF)
		for (let noteNumber = 0; noteNumber <= 0x7F; noteNumber++) { // From note 0 to 127 (0x00 to 0x7F)
			midi.value.send([(0x80 | channel), noteNumber, 0]);
		}
	}
}

/** value is between -1024 and +1024 **/
function bend(value) {
	value = parseInt(value);
	let midiValue = Math.round((value + 1024) / 2048 * 16383);
	let lsb = midiValue & 0x7F;
	let msb = (midiValue >> 7) & 0x7F;
	return [lsb, msb];
}

function drawSelect(selectLast = false) {
	registerSelect.innerHTML = "";
	for(let key of registers.keys()) {
		let option = document.createElement("option");
		option.textContent = key;
		registerSelect.appendChild(option);
		if(selectLast) {
			registerSelect.value = option.value;
		}
	}

	document.querySelectorAll("fieldset.prong button, fieldset.prong input").forEach(el => {
		el.disabled = registerSelect.options.length === 0;
		if(el instanceof HTMLInputElement) {
			el.value = 0;
		}
	});
}

function loadRegister() {
	let index = registerSelect.value;
	setOscs(
		registers[index][0],
		registers[index][1],
		registers[index][2],
		registers[index][3],
	);
	prongSlider.value = 0;
}

function setOscs(...oscLevels) {
	let inputEvent = new Event("input");
	osc[0].value = oscLevels[0];osc[0].dispatchEvent(inputEvent);
	osc[1].value = oscLevels[1];osc[1].dispatchEvent(inputEvent);
	osc[2].value = oscLevels[2];osc[2].dispatchEvent(inputEvent);
	osc[3].value = oscLevels[3];osc[3].dispatchEvent(inputEvent);
}

function prongChange(e) {
	let registerIndex = parseInt(registerSelect.value);
	let maxRegisterIndex = registerSelect.options.length - 1;
	let nextRegisterIndex = registerIndex + 1;

	if(nextRegisterIndex > maxRegisterIndex) {
		nextRegisterIndex = 0;
	}

	let toValues = [
		parseInt(registers[nextRegisterIndex][0]),
		parseInt(registers[nextRegisterIndex][1]),
		parseInt(registers[nextRegisterIndex][2]),
		parseInt(registers[nextRegisterIndex][3]),
	];
	let currentValues = [
		parseInt(registers[registerIndex][0]),
		parseInt(registers[registerIndex][1]),
		parseInt(registers[registerIndex][2]),
		parseInt(registers[registerIndex][3]),
	];
	let scalar = pingPong
		? prongSlider.value / 1024
		: Math.abs(prongSlider.value - 1024) / 1024;

	if(pingPong) {
		if(prongSlider.value >= 1024) {
			next();
			pingPong = false;
		}
	}
	else {
		if(prongSlider.value <= 0) {
			next();
			pingPong = true;
		}
	}

	let interpolatedValues = currentValues.map((currentValue, index) => {
		let toValue = toValues[index];
		return currentValue + scalar * (toValue - currentValue);
	});

	osc[0].value = interpolatedValues[0];
	osc[1].value = interpolatedValues[1];
	osc[2].value = interpolatedValues[2];
	osc[3].value = interpolatedValues[3];
	let inputEvent = new Event("input");
	osc[0].dispatchEvent(inputEvent);
	osc[1].dispatchEvent(inputEvent);
	osc[2].dispatchEvent(inputEvent);
	osc[3].dispatchEvent(inputEvent);
}

function next() {
	if (registerSelect.selectedIndex >= registerSelect.options.length - 1) {
		registerSelect.selectedIndex = 0;
	} else {
		registerSelect.selectedIndex++;
	}
	let changeEvent = new Event("change");
	registerSelect.dispatchEvent(changeEvent);
}
