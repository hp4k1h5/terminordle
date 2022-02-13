//@ts-strict
import { ServerMsgType, WS, Row, ClientMessage } from '../../lib/structs'
import { createWS } from './'
import { updateAlphabet } from '../../'
import { display } from '../../cli/printer'
import { msg } from './msg'

export async function requestSession(
  address: string,
  session_id: string | undefined,
) {
  // create connection
  // server eventually responds with user_id
  const ws = await createWS(address)

  // request session id
  if (!session_id) {
    msg(ws, { type: ServerMsgType.create, user_id: ws.user_id })
  } else {
    msg(ws, { type: ServerMsgType.join, user_id: ws.user_id, session_id })
  }

  return ws
}

export function guess(cnx: WS, message: ClientMessage) {
  updateAlphabet(message.content as Row)

  display.addToGuesses(message.content as Row)
  display.print()
}

export function again(cnx: WS, message: ClientMessage) {
  
}
