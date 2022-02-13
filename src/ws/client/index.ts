import { WebSocket } from 'ws'
import * as chalk from 'chalk'

import {
  WS,
  Message,
  ServerMessage,
  ClientMessage,
  ClientMsgType,
} from '../../lib/structs'
import { guess, again } from './session'
import { display, infoIndex, MsgColors } from '../../cli'
import { validateMsg } from './msg'
export { requestSession } from './session'

const URL = 'localhost'

const msgTypeToFn: {
  [key in ClientMsgType]: (
    ws: WS,
    msg: ClientMessage,
  ) => ServerMessage | void | Promise<void>
} = {
  user_id: setUserId,
  session_id: setSessionId,
  info,
  again,
  error,
  guess,
}

function error(ws: WS, data: string | Message) {
  // TODO:
  console.error('error from server', data)
}

function info(cnx: WS, message: Message, color: MsgColors = MsgColors.green) {
  if (typeof message.content === 'string') {
    display.alterMessage(message.content, color)
    display.print()
  }
}

function setUserId(cnx: WS, message: Message) {
  if (!message || typeof message.content !== 'string') {
    return
  }

  cnx.user_id = message.content
  display.screen.splice(
    infoIndex(),
    0,
    `${chalk.cyanBright('user id: ')} ${cnx.user_id}`,
  )
  display.print()
}

function setSessionId(cnx: WS, message: Message) {
  if (cnx.session_id) return
  cnx.session_id = message.session_id

  display.alterMessage('type a guess and hit enter ', MsgColors.bold)
  display.screen.splice(
    infoIndex() - 1,
    0,
    `${chalk.blueBright('session id:')} ${cnx.session_id}`,
  )
  display.print()
}

export function createWS(url = URL): Promise<WS> {
  return new Promise(keep => {
    const ws = new WebSocket(`ws://${url}`)

    ws.on('open', function () {
      keep(ws)
    })

    ws.on('message', async function (data: string) {
      let message: ClientMessage | string
      try {
        message = validateMsg(ws, data)
      } catch (e) {
        return
      }

      try {
        await msgTypeToFn[message.type](ws, message)
      } catch (e) {
        console.error('action error', message, e) // TODO:
      }
    })

    ws.on('error', function (data) {
      console.error('received: %s', data) // TODO:
      return
    })

    ws.on('close', function () {
      process.exit(0)
    })
  })
}
