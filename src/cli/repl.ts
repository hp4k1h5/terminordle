import * as readline from 'readline'

import { Row, MsgType } from '../lib/structs'
import './args'
import { wordToRow, validateResponse, evaluateGuess, isCorrect } from '../'
import { display } from './printer'
import { msg } from '../ws/client/msg'
import { getRand, names, words } from '../util'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
rl.on('close', function () {
  process.exit(0)
})

export async function question(query): Promise<string> {
  return new Promise(keep => {
    rl.question(query, function (answer) {
      keep(answer)
    })
  })
}

const wordList = Object.keys(words)
export async function repl(cnx = undefined) {
  let answer
  if (!cnx) {
    let filteredWordList = wordList.filter(word => word.length === 5)
    answer = wordToRow(getRand(filteredWordList))
  }

  const guesses: Array<Row> = []
  let guess: Row = wordToRow('     ')

  // loop
  while (!isCorrect(guess)) {
    display.print()

    let response: string
    try {
      response = await question('')
      validateResponse({ type: MsgType.guess, content: response })
    } catch (e) {
      display.alterMessage(e)
      continue
    }

    guess = wordToRow(response)

    // handle network connections
    if (cnx) {
      msg(cnx, {
        type: MsgType.guess,
        content: response,
        user_id: cnx.user_id,
        session_id: cnx.session_id,
      })
      continue
    }

    // otherwise continue locally
    evaluateGuess(guess, answer)

    guesses.push(guess)
    display.addToGuesses(guess)
    // prints at top of loop
  }

  // game over print and exit
  display.print()
  console.log('CORRECT!')
  process.exit(0)
}
