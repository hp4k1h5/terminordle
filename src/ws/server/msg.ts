//@ts-strict
import * as chalk from 'chalk' // TODO: replace with logging
import { WS, Message, MsgType } from '../../lib/structs'

export function msg(cnx: WS, m: Message) {
  cnx.send(JSON.stringify(m))
}

export function err(cnx: WS, e: string | unknown, send = false) {
  if (typeof e !== 'string') return

  console.error(chalk.redBright(cnx.user_id, cnx.session_id, e))

  send && msg(cnx, { type: MsgType.error, content: e })
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
