//@ts-strict
import { WebSocketServer } from 'ws'
import { WS, Message, MsgType } from '../../lib/structs'
import { validateMsg, msg, err } from './msg'
import { remove, createSession, join, guess } from './session'
import { getRand, names } from '../../util'

const msgTypeToFn = {
  create: createSession,
  join: join,
  guess: guess,
  info: () => null,
  user_id: () => null,
  session_id: () => null,
  error: () => null,
}

const MAX_CNX = 1_000
export function createWSS(port = 8080) {
  const wss = new WebSocketServer({
    port,
    backlog: 100,
    maxPayload: 256,
    clientTracking: true,
  })

  // heartbeat
  const cycle = setInterval(function () {
    wss.clients.forEach((client: WS) => {
      if (client.is_alive === false) {
        remove(client)
        return
      }

      // reset
      client.is_alive = false
      client.ping()
    })
  }, 30_000)

  wss.on('close', function close() {
    clearInterval(cycle)
  })

  wss.on('connection', function (cnx: WS) {
    if (wss.clients.size >= MAX_CNX) {
      err(cnx, 'overload')
      cnx.close()
      return
    }

    cnx.on('close', function () {
      remove(cnx)
    })

    cnx.on('pong', heartbeat)

    cnx.on('message', function (data: string) {
      let message: Message
      try {
        message = validateMsg(cnx, data)
      } catch (e) {
        return
      }

      let response: Message | null | undefined
      try {
        response = msgTypeToFn[message.type](cnx, message)
      } catch (e) {
        err(cnx, e)
        return
      }

      response && msg(cnx, response)
    })

    try {
      cnx.user_id = userId()
    } catch (e) {
      err(cnx, e)
      remove(cnx)

      return
    }

    // send user id back
    msg(cnx, {
      type: MsgType.user_id,
      content: cnx.user_id,
      user_id: cnx.user_id,
    })
  })

  return wss
}

function heartbeat(this: WS) {
  this.is_alive = true
  return heartbeat
}

const nameList = Object.keys(names)

export function userId(): string {
  let attempts = 0
  const MAX_ATTEMPTS = 10
  const _nameList = nameList.filter(name => names[name] === false)
  let name
  while (!name && attempts++ < MAX_ATTEMPTS) {
    name = getRand(_nameList)

    // double check names
    if (names[name] === false) {
      names[name] = true
      return name
    }
  }

  throw 'no available user id'
}
