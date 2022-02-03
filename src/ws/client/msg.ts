//@ts-strict
import { WS, Message, MsgType } from '../../lib/structs'

export function msg(cnx: WS, m: Message) {
  cnx.send(JSON.stringify(m))
}

export function validateMsg(cnx: WS, data: string | Message): Message {
  try {
    data = JSON.parse(data as string) as Message
  } catch (e) {
    throw 'bad json'
  }

  if (!data.type || !(data.type in MsgType)) {
    throw `bad message type ${data.type}`
  }

  return data
}
