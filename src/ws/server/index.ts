import * as fs from 'fs'
import { createServer, Server } from 'https'

import * as dotenv from 'dotenv'
dotenv.config()

import { WebSocketServer } from 'ws'
import {
  WS,
  ClientMessage,
  ClientMsgType,
  ServerMessage,
  ServerMsgType,
} from '../../lib/structs'
import { validateMsg, msg, err } from './msg'
import { remove, createSession, join, guess, again } from './session'
import { getRand, names, Log } from '../../util'

const server: Server | null =
  process.env.NODE_ENV === 'production'
    ? createServer({
        key: fs.readFileSync('' + process.env.SSL_KEY_PATH),
        cert: fs.readFileSync('' + process.env.SSL_FULLCHAIN_PATH),
      })
    : null

const msgTypeToFn: {
  [key in ServerMsgType]: (
    ws: WS,
    msg: ServerMessage,
    log?: Log,
  ) => ClientMessage | void | undefined
} = {
  create: createSession,
  join: join,
  guess: guess,
  again,
}

const MAX_CNX = 1_000
export function createWSS(
  port = 8080,
  host = 'localhost',
  log: Log | undefined,
) {
  const opts = {
    host,
    backlog: 100,
    maxPayload: 256,
    clientTracking: true,
    ...(server ? { server } : { port }),
  }

  const wss = new WebSocketServer(opts)

  wss.on('error', function (e) {
    log && log.log({ err: e.toString() })
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
      err(cnx, `overload : ${cnx}`, log)
      cnx.close()
      return
    }

    cnx.on('error', e => {
      log && log.log({ err: e.toString(), user_id: cnx.user_id })
    })

    cnx.on('close', function () {
      remove(cnx, log)
    })

    cnx.on('pong', heartbeat)

    cnx.on('message', function (data: string) {
      let message: ServerMessage
      try {
        message = validateMsg(cnx, data)
      } catch (e) {
        msg(cnx, { type: ClientMsgType.error, content: 'bad message' })
        err(cnx, e, log)

        return
      }

      let response: ClientMessage | undefined | void
      try {
        response = msgTypeToFn[message.type](cnx, message, log)
      } catch (e) {
        err(cnx, e, log)
        return
      }

      response && msg(cnx, response)
    })

    try {
      cnx.user_id = userId()
    } catch (e) {
      err(cnx, e, log)
      remove(cnx)

      return
    }

    log && log.log({ connection: 'established', with: cnx.user_id })

    // send user id back
    msg(cnx, {
      type: ClientMsgType.user_id,
      content: cnx.user_id,
      user_id: cnx.user_id,
    })
  })

  // ssl support
  server && server.listen(port)

  return wss
}

function heartbeat(this: WS) {
  this.is_alive = true
  return heartbeat
}

const nameList = Object.keys(names)

export function userId(): string | undefined {
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
}
