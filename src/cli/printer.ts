import * as chalk from 'chalk'

import { Visibility, Option, Row } from '../lib/structs'
import { letters } from '../util'
import { rl } from './repl'

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
  count: number
  constructor() {
    this.count = 0
    this.screen = [
      chalk.greenBright('Welcome to terminordle'),
      `>> ${' '.repeat(20)} <<`,
      typesetAlphabet(),
    ]
  }

  addToGuesses(guess: Row) {
    this.screen.splice(infoIndex() + 1, 1, typesetAlphabet())
    this.screen.push(typesetGuess(guess))

    // clear message
    this.alterMessage()
  }

  clear(user_id: string | undefined, session_id: string | undefined) {
    // reset screen
    this.screen = [
      chalk.greenBright('     terminordle'),
      `${chalk.blueBright('session id:')} ${session_id}`,
      `${chalk.cyanBright('user id: ')} ${user_id}`,
      `>> ${' '.repeat(20)} <<`,
      typesetAlphabet(true),
    ]

    // clear info message
    this.alterMessage()
  }

  alterMessage(message = '', color: MsgColors = MsgColors['redBright']) {
    const infoInd = infoIndex()

    this.screen[infoInd] = `>> ${chalk[color](message)}${' '.repeat(
      Math.max(21 - message.length, 0),
    )}<<`
  }

  print() {
    console.clear()
    process.stdout.write(this.screen.join('\n') + '\n')
  }
}

export enum MsgColors {
  redBright = 'redBright',
  green = 'green',
  bold = 'bold',
}

export const display = new Display()

export function infoIndex(): number {
  return display.screen.findIndex(line => /^>>/.test(line))
}
