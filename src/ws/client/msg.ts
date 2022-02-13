//@ts-strict
import { WS, ClientMessage, ServerMessage, MsgType } from '../../lib/structs'

export function msg(cnx: WS, m: ServerMessage) {
  cnx.send(JSON.stringify(m))
}

export function validateMsg(
  cnx: WS,
  data: string | ClientMessage,
): ClientMessage {
  try {
    data = JSON.parse(data as string) as ClientMessage
  } catch (e) {
    throw 'bad json'
  }

  if (!data.type || !(data.type in MsgType)) {
    throw `bad message type ${data.type}`
  }

  return data
}
