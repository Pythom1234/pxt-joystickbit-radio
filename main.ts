//% block="Joystick:bit" color=#984611 icon="\uf11b"
namespace joystickbit {
    export enum Buttons {
        A = 0,
        B = 1,
        C = 2,
        D = 3,
        E = 4,
        F = 5,
        Logo = 6
    }
    export enum Axis {
        X = 1,
        Y = 2
    }
    export let lastRecieved = "0000000:512:512"
    export let recieved = "0000000:512:512"
    //% block="run service on joystickbit on radio address $address"
    //% block.loc.cs="spustit službu na joystickbit na rádio adrese $address"
    //% address.min=0
    //% address.max=255
    //% weight=100
    //% blockGap=50
    export function runService(address: number): void {
        radio.setGroup(address)
        const buttonPins: DigitalPin[] = [DigitalPin.P12, DigitalPin.P13, DigitalPin.P14, DigitalPin.P15]
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P13, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P14, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        pins.digitalWritePin(DigitalPin.P16, 1)
        music.setBuiltInSpeakerEnabled(false)
        basic.showLeds(`
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `)
        radio.onReceivedNumber(function (receivedNumber: number) {
            led.plotBarGraph(radio.receivedPacket(RadioPacketProperty.SignalStrength) + 128, 100)
        })
        radio.onReceivedValue(function (name: string, value: number) {
            if (name == "v") {
                pins.digitalWritePin(DigitalPin.P16, 0)
                basic.pause(value)
                pins.digitalWritePin(DigitalPin.P16, 1)
            } else {
                music.play(music.stringPlayable(name, 120), music.PlaybackMode.InBackground)
                console.log(name)
            }
        })
        while (true) {
            let toSend: string = ""
            if (input.buttonIsPressed(Button.A)) {
                toSend += "1"
            } else {
                toSend += "0"
            }
            if (input.buttonIsPressed(Button.B)) {
                toSend += "1"
            } else {
                toSend += "0"
            }
            for (let pin of buttonPins) {
                if (pins.digitalReadPin(pin) == 0) {
                    toSend += "1"
                } else {
                    toSend += "0"
                }
            }
            if (input.logoIsPressed()) {
                toSend += "1"
            } else {
                toSend += "0"
            }
            toSend += ":"
            toSend += convertToText(pins.analogReadPin(AnalogPin.P1))
            toSend += ":"
            toSend += convertToText(pins.analogReadPin(AnalogPin.P2))
            radio.sendString(toSend)
            basic.pause(10)
        }
    }
    //% block="init reciever on radio address $address"
    //% block.loc.cs="inicializovat přijímač na rádio adrese $address"
    //% address.min=0
    //% address.max=255
    //% weight=99
    export function init(address: number): void {
        radio.setGroup(address)
        radio.onReceivedString(function (receivedString: string) {
            lastRecieved = recieved
            recieved = receivedString
            console.log(recieved)
        })
        basic.forever(function () {
            radio.sendNumber(0)
        })
    }
    //% block="is pressed button $button"
    //% block.loc.cs="je stisknuto tlačítko $button"
    //% weight=98
    export function getButton(button: Buttons): boolean {
        return recieved[button] == "1"
    }
    //% block="get joystick value, axis $axis"
    //% block.loc.cs="hodnota joysticku, osa $axis"
    //% weight=97
    export function getJoystickValue(axis: Axis): number {
        return parseInt(recieved.split(":")[axis])
    }
    //% block="vibrate for $time ms"
    //% block.loc.cs="vibrovat po $time ms"
    //% weight=96
    export function vibrate(time: number): void {
        radio.sendValue("v", time)
    }
    //% block="play melody $melody"
    //% block.loc.cs="zahrát melodii $melody"
    //% melody.shadow="melody_editor"
    //% weight=95
    export function playMelody(melody: string): void {
        radio.sendValue(melody, 0)
    }
}