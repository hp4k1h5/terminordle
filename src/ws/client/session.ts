import { ServerMsgType, WS, Row, ClientMessage } from '../../lib/structs'
import { createWS } from './'
import { updateAlphabet } from '../../'
import { display, MsgColors } from '../../cli/printer'
import { _rl, rl, question, repl, resetRl } from '../../cli/repl'
import { msg } from './msg'

export async function requestSession(
  address: string,
  session_id: string | undefined,
) {
  // create connection
  const ws = await createWS(address)
  // server eventually responds with user_id

  // request session id
  if (!session_id) {
    msg(ws, { type: ServerMsgType.create, user_id: ws.user_id })
  } else {
    msg(ws, { type: ServerMsgType.join, user_id: ws.user_id, session_id })
  }

  return ws
}

let deciding = false

export function guess(cnx: WS, message: ClientMessage) {
  if (deciding) return
  updateAlphabet(message.content as Row)

  display.addToGuesses(message.content as Row)
  display.print()
}

export async function again(cnx: WS, message: ClientMessage) {
  display.alterMessage(`WINNER: ${message['content']}!`, MsgColors['green'])
  display.print()

  // close readline
  rl.close()

  deciding = true

  // open new realine
  const again_rl = _rl()
  const again_yn = await question('play again?  y/n ', again_rl)

  again_rl.close()

  if (!/^(y|n)$/i.test(again_yn)) {
    cnx.close()
  }

  msg(cnx, { type: ServerMsgType.again, content: again_yn })

  if (again_yn === 'n') {
    return
  }

  display.clear(cnx.user_id, cnx.session_id)
  resetRl()

  deciding = false

  await repl(cnx)
}
