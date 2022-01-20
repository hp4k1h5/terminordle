import * as fs from 'fs'

import { Visibility, Option, Row } from '../lib/structs'

export { typesetGuess, typesetAlphabet } from './typeset'
export { names } from './data/names'

const file = fs.readFileSync('./src/util/data/wordlist-5_5K.txt', 'utf8')
export const words = file
  .split('\n')
  .reduce((a, v, i) => ((a[v.toLocaleLowerCase()] = true), a), {})

export const alphabet = Array.from(Array(26)).map((v, i) =>
  String.fromCharCode(i + 97),
)

export const letters: { [key: string]: Visibility } = alphabet.reduce(
  (a, v) => {
    a[v] = Visibility.hidden
    return a
  },
  {},
)

export function getRand(from: string[]): string {
  return from[Math.floor(Math.random() * (from.length + 1))]
}
