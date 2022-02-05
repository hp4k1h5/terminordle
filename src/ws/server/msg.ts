//@ts-strict
import {
  WS,
  ServerMessage,
  ClientMessage,
  MsgType,
  ServerMsgType,
} from '../../lib/structs'
import { Log } from '../../util'

export function msg(cnx: WS, m: ClientMessage) {
  cnx.send(JSON.stringify(m))
}

export function err(cnx: WS, e: string | unknown, log: false | Log = false) {
  if (typeof e !== 'string') return

  log && log.log({ [MsgType.error]: e, date_utc: new Date().toJSON() })
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
