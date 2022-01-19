import * as chalk from 'chalk'
import { Message, MsgType } from '../../lib/structs'

export function msg(cnx, m: Message) {
  cnx.send(JSON.stringify(m))
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
