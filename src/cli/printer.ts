import * as chalk from 'chalk'

import { Row } from '../lib/structs'
import { typesetAlphabet, typesetGuess } from '../util/'

class Display {
  screen: string[]
  offBy: number
  constructor() {
    this.screen = [
      'welcome to terminordle',
      `>> ${' '.repeat(20)} <<`,
      typesetAlphabet(),
    ]
    this.offBy = 0
  }

  addToGuesses(guess: Row) {
    this.screen.splice(infoIndex() + 1, 1, typesetAlphabet())
    this.screen.push(typesetGuess(guess))

    this.alterMessage()
    this.offBy = 0
  }

  alterMessage(message: string = '', color: string = 'redBright') {
    this.screen[this.screen.findIndex(line => /^>>/.test(line))] = `>> ${chalk[
      color
    ](message)}${' '.repeat(Math.max(21 - message.length, 0))}<<`
    this.offBy = 1
  }

  print() {
    process.stdout.moveCursor(0, -1 * (this.screen.length + this.offBy))
    process.stdout.clearScreenDown()
    this.screen.forEach(line => process.stdout.write(line + '\n'))
  }
}

export const display = new Display()

export function infoIndex(): number {
  return display.screen.findIndex(line => /^>>/.test(line))
}
