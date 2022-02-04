//@ts-strict
import { WS, Message, MsgType } from '../../lib/structs'
import { Log } from '../../util'

export function msg(cnx: WS, m: Message) {
  cnx.send(JSON.stringify(m))
}

export function err(cnx: WS, e: string | unknown, log: false | Log = false) {
  if (typeof e !== 'string') return

  log && log.log({ [MsgType.error]: e, date_utc: new Date().toJSON() })
}

export function validateMsg(cnx: WS, data: string) {
  let message: Message
  try {
    message = JSON.parse(data)
  } catch (e) {
    throw 'bad json'
  }

  if (!message.type || !(message.type in MsgType)) {
    throw `bad message type ${message.type}`
  }

  return message
}
