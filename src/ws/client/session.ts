import { MsgType, Row } from '../../lib/structs'
import { createWS } from './'
import {
  wordToRow,
  validateResponse,
  evaluateGuess,
  updateAlphabet,
  isCorrect,
} from '../../'
import { display } from '../../cli/printer'
import { msg } from './msg'

export async function requestSession(session_id: string | undefined) {
  // create connection
  // server eventually responds with username
  const ws = await createWS()

  // request session id
  if (!session_id) {
    msg(ws, { type: MsgType.create, user_id: ws.user_id })
  } else {
    msg(ws, { type: MsgType.join, user_id: ws.user_id, session_id })
  }

  return ws
}

export function guess(cnx, message) {
  updateAlphabet(message.content)

  display.addToGuesses(message.content)
  display.print()
}
