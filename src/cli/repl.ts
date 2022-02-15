import * as readline from 'readline'

import { Row, ServerMsgType, WS } from '../lib/structs'
import './args'
import { wordToRow, validateResponse, evaluateGuess, isCorrect } from '../'
import { display } from './printer'
import { msg } from '../ws/client/msg'
import { getRand, words } from '../util'

export const _rl = function () {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

// replace cursor if the player has entered text
export function moveCursor() {
  if (rl.getCursorPos().cols) {
    rl.write(null, { ctrl: true, name: 'u' })
    rl.write(null, { ctrl: true, name: 'y' })
  }
}

export let rl: readline.Interface

export function resetRl(cnx: WS) {
  const rl = _rl()

  // handle ctrl-c
  rl.on('SIGINT', () => {
    // kill cnx
    cnx && cnx.terminate()

    // update player
    display.alterMessage('goodbye')
    display.print()

    // exit
    process.exit(0)
  })

  return rl
}

export async function question(query: string, rl_ = rl): Promise<string> {
  return new Promise(keep => {
    rl_.question(query, function (answer) {
      keep(answer)
    })
  })
}

const wordList = Object.keys(words)

// returns main event loop for player interaction
export async function repl(cnx: WS | undefined = undefined) {
  let answer
  if (!cnx) {
    const filteredWordList = wordList.filter(word => word.length === 5)
    answer = wordToRow(getRand(filteredWordList))

    rl = _rl()
  } else {
    rl = resetRl(cnx)
  }

  const guesses: Array<Row> = []
  let guess: Row = wordToRow('     ')

  // loop
  while (!isCorrect(guess)) {
    display.print()

    let response: string
    try {
      response = await question('')
      validateResponse({ type: ServerMsgType.guess, content: response })
    } catch (e) {
      display.alterMessage(e as string)
      continue
    }

    guess = wordToRow(response)

    // handle network connections
    if (cnx) {
      msg(cnx, {
        type: ServerMsgType.guess,
        content: response,
        user_id: cnx.user_id,
        session_id: cnx.session_id,
      })
      continue
    }

    // otherwise continue locally
    evaluateGuess(guess, answer as Row)

    guesses.push(guess)
    display.addToGuesses(guess)
    // prints at top of loop
  }

  // game over print and exit
  display.print()
  console.log('CORRECT!')
  process.exit(0)
}
