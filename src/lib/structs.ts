//@ts-strict
export {
  WS,
  Message,
  ServerMessage,
  ClientMessage,
  MsgType,
  ServerMsgType,
  ClientMsgType,
  User,
} from './net'

export enum Visibility {
  hidden = 'hidden',
  guessed = 'guessed',
  exists = 'exists',
  revealed = 'revealed',
}

export interface Option {
  letter: string
  visibility: Visibility
}

export type Row = Array<Option>
