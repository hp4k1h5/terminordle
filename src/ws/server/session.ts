import {
  WS,
  Message,
  ClientMessage,
  ServerMessage,
  MsgType,
  ClientMsgType,
  User,
  Row,
} from '../../lib/structs'
import { wordToRow, validateResponse, evaluateGuess, isCorrect } from '../../'
import { wss } from '../../cli/args'
import { msg, err } from './msg'
import { getRand, names, words, Log } from '../../util'

export class Session {
  session_id: string
  guests: User[]
  answer: string
  guesses: Row[]
  reset_lock: boolean
  constructor(session_id: string) {
    this.session_id = session_id
    this.guests = []
    this.answer = 'ibudi'
    this.guesses = []
    this.reset_lock = false
  }
}

export function remove(ws: WS, log?: Log) {
  if (!ws.session_id) return
  const userSession = sessions[ws.session_id]

  if (userSession && userSession.guests) {
    userSession.guests.splice(
      userSession.guests.findIndex(guest => guest.id === ws.user_id),
      1,
    )
    log &&
      log.log({
        removing: ws.user_id,
        from: ws.session_id,
        clients: wss.clients.size,
      })
  }

  // delete session if empty
  if (userSession && userSession.guests.length === 0) {
    delete sessions[ws.session_id]
  }

  // free user name
  if (ws.user_id && names[ws.user_id]) {
    names[ws.user_id] = false
  }

  // only close open(ing) connections
  if (ws.readyState < 2) {
    ws.close()
  }
}

export function createSession(
  ws: WS,
  message?: ServerMessage,
  log?: Log,
): ClientMessage | undefined {
  let session_id: string
  try {
    session_id = sessionId()
  } catch (e) {
    return
  }

  const answer = selectAnswer()
  sessions[session_id].answer = answer

  const response: ClientMessage = {
    type: MsgType.session_id,
    user_id: ws.user_id,
    content: session_id,
    session_id,
  }

  log && log.log({ session_id, answer })
  join(ws, response)
}

const wordList = Object.keys(words)
export const sessions: { [key: string]: Session } = {}

function sessionId(): string {
  let id
  let tries = 0
  const MAX_TRIES = 10
  while (!id && tries++ < MAX_TRIES) {
    id = [getRand(wordList), '-', getRand(wordList)].join('')
    if (!sessions[id]) {
      sessions[id] = new Session(id)

      return id
    }
    id = undefined
  }

  throw 'no session available'
}

const filteredWordList = wordList.filter(
  word => word.length === 5 && /[a-z]/i.test(word),
)
function selectAnswer() {
  return getRand(filteredWordList)
}

export function join(ws: WS, message: Message): undefined {
  if (!message || !message.session_id || !sessions[message.session_id]) {
    err(ws, `no such session id ${message.session_id}`)
    return
  }

  const response: ClientMessage = {
    type: MsgType.session_id,
    user_id: message.user_id,
  }

  // limit users to one session per user
  const userSession = Object.values(sessions).find((session: Session) =>
    session.guests.find(guest => guest.id === message.user_id),
  )

  if (!userSession) {
    sessions[message.session_id].guests.push({ id: ws.user_id } as User)
    response.session_id = message.session_id
  } else {
    response.session_id = userSession.session_id
  }

  // update ws
  ws.session_id = message.session_id
  // send session_id
  msg(ws, response)

  // replay guesses back to client
  sessions[message.session_id].guesses.forEach(guess => {
    msg(ws, { type: MsgType.guess, content: guess })
  })
}

export function guess(ws: WS, message: ServerMessage, log?: Log): undefined {
  try {
    validateResponse(message)
  } catch (e) {
    err(ws, e)
    return
  }

  if (!message.session_id) {
    err(ws, 'no session_id')
    return
  }

  const session = sessions[message.session_id]
  if (!session) {
    err(ws, 'no such session_id')
    return
  }

  const MAX_GUESSES = 20
  if (session.guesses.length >= MAX_GUESSES) {
    endSession(ws, 'out of guesses (20)')
    return
  }

  const guess = wordToRow(message.content as string)
  evaluateGuess(guess, wordToRow(session.answer))
  session.guesses.push(guess)

  // broadcast guess to session guests
  const sessionGuests = getGuests(session)
  const response: ClientMessage = {
    type: ClientMsgType.guess,
    content: guess,
  }

  const correct = isCorrect(guess)
  // game over free lock
  if (correct) session.reset_lock = false

  sessionGuests.forEach(guest => {
    // update client
    msg(guest, response)

    // check win condition
    if (correct) {
      const winMsg = {
        ...message,
        type: ClientMsgType.again,
        content: ws.user_id,
      }

      msg(guest, winMsg)
    }
  })
}

export function again(cnx: WS, message: ServerMessage, log: Log | undefined) {
  if (!message || typeof message.content !== 'string' || !cnx.session_id) {
    remove(cnx, log)
    return undefined
  }

  if (message.content !== 'y') {
    msg(cnx, {
      type: ClientMsgType.info,
      content: 'goodbye',
    })
    remove(cnx, log)

    return
  }

  log &&
    log.log({
      again: message.content,
      user_id: cnx.user_id,
    })

  // get session
  const session = sessions[cnx.session_id]

  // another session member has reset the session
  if (session.reset_lock && cnx.session_id) {
    // replay guesses back to client
    session.guesses.forEach(guess => {
      msg(cnx, { type: MsgType.guess, content: guess })
    })

    return
  }

  // first to play again resets the session
  session.reset_lock = true
  // reset_lock is freed by win/loss condition

  // TODO: again for loss condition

  // reset answer
  const answer = selectAnswer()

  session.answer = answer
  // reset guesses
  session.guesses = []

  log && log.log({ session_id: cnx.session_id, answer })
}

function endSession(cnx: WS, message: string) {
  if (!cnx.session_id) return
  const session = sessions[cnx.session_id]
  if (!session) {
    err(cnx, message)
    // still boot the connection
    remove(cnx)
    return
  }

  // boot all session guests from server
  const guests = getGuests(session)
  guests.forEach(guest => {
    err(guest, message)
    remove(guest)
  })
}

function getGuests(session: Session) {
  const sessionGuests: WS[] = []
  wss.clients.forEach((client: WS) => {
    if (
      session.guests.find(guest => {
        return guest.id === client.user_id
      })
    ) {
      sessionGuests.push(client)
    }
  })
  return sessionGuests
}
