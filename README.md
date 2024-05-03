Ping-pong drone - MIDI MPE controller.
======================================

This project is built as an experiment into MPE (MIDI Polyphonic Expression). It is being prototyped as a browser-based controller before being built as a standalone hardware controller.

## 4 oscillator drone interpolator

Scope of the project:

1. Set four oscillators to sound "nice". Make a chord or something.
2. Store the current state into a register by pressing the SET button.
3. Set the oscillators again to a different chord.
4. Store the new state into the next register by pressing SET again.
5. Repeat until you have the chord progression you want.
6. Use the main knob to transition between register 1 and 2.
7. When the main knob reaches 100%, moving it back to 0% will transition between 2 and 3.
8. This "ping pong" transition will loop around to the first register when the last one is reached.

## Web prototype

To quickly prototype this working, a browser-based controller is made. No frills, just black and white, dirty code.

![Screenshot of PRONG in action within the web browser](img.png)

## Hardware build

There will be only one button on the physical product, which will have three functions:

- Press once: SET
- Hold for 1 second: Reset to register 0
- Hold for 5 seconds: CLEAR

Instead of using the START/STOP/LEARN buttons, each oscillator will have its own on-off switch. This also helps when tuning an oscillator, allowing the others to be temporarily muted.

### Bill of materials

Items are purchased locally where possible. [RF Potts](https://www.rfpotts.com/) in Derby, UK is a good supplier of hobby electronics parts.

- 1 x metal enclosure box: £5.00
- 4 x 13 mm pot knobs: £0.63 ea
- 1 x 30 mm pot knob: £1.26 ea
- 4 x On/off toggle switch: £1.25 ea
- 1 x metal push-to-make button: £2.00 ea
- 1 x surface-mountable female MIDI port: £0.40 ea
- 1 x stripboard: £1.50 ea
- 1 x ATMEGA328P microcontroller: £5.49 ea
- 1 x 7805 voltage regulator: £0.68 ea
- 2 x 22 0Ω resistor: £0.05 ea
- 1 x 10 kΩ resistor: £0.05 ea
- 2 x 10 uF capacitor: £0.32 ea
- 1 x 16 MHz clock crystal: £0.55 ea
- 2 x 22 pF capacitor: £0.28 ea
- 5 x 10 kΩ linear potentiometers: £1.60 ea

// TODO: Hardware is currently WIP
