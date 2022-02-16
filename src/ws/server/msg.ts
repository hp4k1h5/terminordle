//@ts-strict
import {
  WS,
  ServerMessage,
  ClientMessage,
  ServerMsgType,
} from '../../lib/structs'
import { Log } from '../../util'

export function msg(cnx: WS, m: ClientMessage) {
  cnx.send(JSON.stringify(m))
}

export function err(cnx: WS, err: string | Error, log: false | Log = false) {
  if (err instanceof Error) {
    err = err.toString()
  }
  log && log.log({ err })
}

export function validateMsg(cnx: WS, data: string) {
  let message: ServerMessage
  try {
    message = JSON.parse(data)
  } catch (e) {
    throw 'bad json'
  }

  if (!message.type || !(message.type in ServerMsgType)) {
    throw `bad message type ${message.type}`
  }

  return message
}
