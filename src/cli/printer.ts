//@ts-strict
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

export function typesetAlphabet(reset = false): string {
  if (reset) {
    Object.entries(letters).forEach(([letter]) => {
      console.log(letter, 'elter')
      letters[letter] = Visibility.hidden
    })
  }

  return Object.entries(letters)
    .map(([k, v]) => {
      return optColorMap[v](k)
    })
    .join('')
}

class Display {
  screen: string[]
  // offBy: number
  constructor() {
    this.screen = [
      'welcome to terminordle',
      `>> ${' '.repeat(20)} <<`,
      typesetAlphabet(),
    ]
    // this.offBy = 0
  }

  addToGuesses(guess: Row) {
    this.screen.splice(infoIndex() + 1, 1, typesetAlphabet())
    this.screen.push(typesetGuess(guess))

    // clear message
    this.alterMessage()
  }

  clear() {
    this.screen = [
      'welcome to terminordle',
      `>> ${' '.repeat(20)} <<`,
      typesetAlphabet(true),
    ]
    this.alterMessage()
  }

  alterMessage(message = '', color: MsgColors = MsgColors['redBright']) {
    console.log('ALERTER MESSAGE', message)
    this.screen[this.screen.findIndex(line => /^>>/.test(line))] = `>> ${chalk[
      color
    ](message)}${' '.repeat(Math.max(21 - message.length, 0))}<<`
  }

  print() {
    console.clear()
    // process.stdout.moveCursor(0, -1 * (this.screen.length + this.offBy))
    // process.stdout.clearScreenDown()
    this.screen.forEach(line => process.stdout.write(line + '\n'))
  }
}

export enum MsgColors {
  redBright = 'redBright',
  green = 'green',
}

export const display = new Display()

export function infoIndex(): number {
  return display.screen.findIndex(line => /^>>/.test(line))
}
