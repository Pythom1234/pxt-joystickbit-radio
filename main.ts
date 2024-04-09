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
    let lastRecieved = "0000000:512:512"
    let recieved = "0000000:512:512"
    //% block="run service on joystickbit on radio address $address"
    //% block.loc.cs="spustit službu na joystickbit na rádio adrese $address"
    //% address.min=0
    //% address.max=255
    //% weight=100
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
        radio.onReceivedValue(function(name: string, value: number) {
            if (name == "v") {
                pins.digitalWritePin(DigitalPin.P16, 0)
                basic.pause(value)
                pins.digitalWritePin(DigitalPin.P16, 1)
            } else {
                music.stringPlayable(name, 120)
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
        radio.onReceivedString(function(receivedString: string) {
            lastRecieved = recieved
            recieved = receivedString
            console.log(recieved)
        })
        control.inBackground(function() {
            radio.sendNumber(0)
        })
    }
    //% block="is pressed button $button"
    //% block.loc.cs="je stisknuto tlačítko $button"
    //% weight=98
    export function getButton(button: Buttons): boolean {
        return recieved[button] == "1"
    }
}