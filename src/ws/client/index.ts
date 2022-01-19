//@/ts-strict
import { WS, WebSocket, Message, MsgType } from '../../lib/structs'
import { validateMsg, msg } from './msg'
export { requestSession } from './session'
import { guess } from './session'
import { display } from '../../cli'
import { infoIndex } from '../../util'

const URL = 'localhost'

const msgTypeToFn = {
  user_id: setUserId,
  session_id: setSessionId,
  info: info,
  error: error,
  guess: guess,
}

function error(ws, data) {
  // TODO:
  console.error('error from server', data)
}
function info(cnx, message: Message) {
  if (typeof message.content === 'string') {
    display.alterMessage(message.content, 'green')
    display.print()
  }
}

function setUserId(cnx: WS, message: Message) {
  if (!message || typeof message.content !== 'string') {
    return
  }

  cnx.user_id = message.content
  display.screen.splice(infoIndex(), 0, `user id: ${cnx.user_id}`)
  display.print()
}

let count = 0
function setSessionId(cnx: WS, message: Message) {
  if (cnx.session_id) return
  cnx.session_id = message.session_id

  display.screen.splice(infoIndex() - 1, 0, `session id: ${cnx.session_id}`)
  display.print()
}

export function createWS(url = URL, port = 8080): Promise<WS> {
  return new Promise(keep => {
    const ws = new WebSocket(`ws://${url}:${port}`)

    ws.on('open', function () {
      console.log('connection established with', ws.url)
      keep(ws)
    })

    ws.on('message', function (data) {
      let message
      try {
        message = validateMsg(ws, data)
      } catch (e) {
        return
      }

      try {
        msgTypeToFn[message.type](ws, message)
      } catch (e) {
        console.error('action error', message, e) // TODO:
      }
    })

    ws.on('error', function (data) {
      console.error('received: %s', data) // TODO:
      return
    })

    ws.on('close', function (data) {
      console.log('goodbye')
      process.exit(0)
    })
  })
}
