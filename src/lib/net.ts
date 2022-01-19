import * as ws from 'ws'

import { Option } from './structs'

export const WebSocketServer = ws.WebSocketServer
export const WebSocket = ws.WebSocket

export interface WS extends ws.WebSocket {
  user_id: string
  session_id: string
}

export enum MsgType {
  user_id = 'user_id',
  session_id = 'session_id',
  info = 'info',
  create = 'create',
  join = 'join',
  guess = 'guess',
  error = 'error',
}

export interface Message {
  type: MsgType
  user_id?: string
  session_id?: string
  content?: string | Option[]
}

export interface User {
  id: string
}
