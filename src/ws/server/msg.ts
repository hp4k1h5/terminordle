import * as chalk from 'chalk' // TODO: replace with logging
import { Message, MsgType } from '../../lib/structs'

export function msg(cnx, m: Message) {
  cnx.send(JSON.stringify(m))
}

export function err(cnx, e, send: boolean = false) {
  console.error(chalk.redBright(cnx.user_id, cnx.session_id, e))

  send && msg(cnx, { type: MsgType.error, content: e })
}

export function validateMsg(cnx, data) {
  try {
    data = JSON.parse(data)
  } catch (e) {
    throw 'bad json'
  }

  if (!data.type || !(data.type in MsgType)) {
    throw `bad message type ${data.type}`
  }

  return data
}
