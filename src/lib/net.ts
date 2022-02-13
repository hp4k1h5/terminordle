//@ts-strict
import { WebSocket } from 'ws'
import { Option } from './structs'

export interface WS extends WebSocket {
  user_id?: string
  session_id?: string
  is_alive?: boolean
}

export enum ServerMsgType {
  create = 'create',
  join = 'join',
  guess = 'guess',
}

export enum ClientMsgType {
  user_id = 'user_id',
  session_id = 'session_id',
  info = 'info',
  again = 'again',
  guess = 'guess',
  error = 'error',
}

type MsgType = ServerMsgType | ClientMsgType
export const MsgType = { ...ServerMsgType, ...ClientMsgType }

export interface Message {
  type: MsgType
  user_id?: string
  session_id?: string
  content?: string | Option[]
  log?: boolean
}

export interface ServerMessage extends Message {
  type: ServerMsgType
}

export interface ClientMessage extends Message {
  type: ClientMsgType
}

export interface User {
  id: string
}
