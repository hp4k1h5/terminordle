import * as chalk from 'chalk'

import { Visibility, Option, Row } from '../lib/structs'
import { letters } from '../util'

const optColorMap = {
  [Visibility.hidden]: chalk.bgWhite,
  [Visibility.guessed]: chalk.bgGray,
  [Visibility.exists]: chalk.bgYellow,
  [Visibility.revealed]: chalk.bgGreenBright,
}

export function typesetGuess(guess: Row): string {
  return guess
    .map((option: Option) => {
      return optColorMap[option.visibility](option.letter)
    })
    .join('')
}

export function typesetAlphabet(): string {
  return Object.entries(letters)
    .map(([k, v]) => {
      return optColorMap[v](k)
    })
    .join('')
}

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
