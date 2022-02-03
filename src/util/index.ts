//@ts-strict
import * as fs from 'fs'

import { Visibility } from '../lib/structs'

export { names } from './data/names'

const file = fs.readFileSync('./src/util/data/wordlist-5_5K.txt', 'utf8')

type Words = { [key: string]: boolean }
export const words: Words = file
  .split('\n')
  .reduce((a: Words, v) => ((a[v.toLocaleLowerCase()] = true), a), {})

export const alphabet = Array.from(Array(26)).map((v, i) =>
  String.fromCharCode(i + 97),
)

type Viz = { [key: string]: Visibility }
export const letters: Viz = alphabet.reduce((a: Viz, v) => {
  a[v] = Visibility.hidden
  return a
}, {})

export function getRand(from: string[]): string {
  return from[Math.floor(Math.random() * (from.length + 1))]
}
