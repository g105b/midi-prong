int osc[4]; // Value of each oscillator (0-1024)

void setup() {
// set the oscillators to test values, to audibly debug the signals
	osc[0] = 500;
	osc[1] = 512;
	osc[2] = 524;
	osc[3] = 536;

// after init, send the reset signals
	Serial.begin(31250);
	delay(500);
	midiReset();

// turn one note on for 1 second...
	delay(2000);
	Serial.write(0x90); //note on, chan 1
	Serial.write(60);
	Serial.write(64);
	delay(1000);
// ...and then turn it off again
	Serial.write(0x80); //note off, chan 1
	Serial.write(60);
	Serial.write(64);
	delay(2000);

// turn on the main 4 oscillators:
	Serial.write(0x90); // note on, chan 1
	Serial.write(60);
	Serial.write(64);
	delay(500);
	Serial.write(0x91); // note on, chan 2
	Serial.write(60);
	Serial.write(64);
	delay(500);
	Serial.write(0x92); // note on, chan 3
	Serial.write(60);
	Serial.write(64);
	delay(500);
	Serial.write(0x93); // note on, chan 4
	Serial.write(60);
	Serial.write(64);
	delay(1000);
}

void loop() {
	osc[2] += 1;
	osc[3] -= 1;

	for(int i = 0; i < 4; i++) {
		if(osc[i] < 0) {
			osc[i] = 0;
		}
		else if(osc[i] > 1023) {
			osc[i] = 1023;
		}

		int midiPitchBendValue = map(osc[i], 0, 1023, 0, 16383);
		int lsb = midiPitchBendValue & 0x7F;
		int msb = (midiPitchBendValue >> 7) & 0x7F;

		Serial.write(0xE0 + i); // pich bend on each channel
		Serial.write(lsb);
		Serial.write(msb);
	}

	delay(100);
}

void midiReset() {
	for(int i = 0; i < 4; i++) {
		int midiPitchBendValue = map(osc[i], 0, 1023, 0, 16383);
		int lsb = midiPitchBendValue & 0x7F;    // least significant byte
		int msb = (midiPitchBendValue >> 7) & 0x7F;   // most significant byte

		Serial.write(0xE0 + i);
		Serial.write(lsb);
		Serial.write(msb);

		for (int note = 0; note < 128; note++) {
			Serial.write(0x80 + i);
			Serial.write(note);
			Serial.write(0);
		}
	}
}
