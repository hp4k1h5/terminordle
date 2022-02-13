#!/usr/bin/env node
import * as process from 'process'

import { WS } from '../lib/structs'
export { display, infoIndex, MsgColors } from './printer'
export { repl } from './repl'
import './args'

export function setSignals(cnx: WS) {
  process.stdin.resume()

  // default
  process.on('SIGINT', () => handleSig.apply(handleSig, [cnx]))
  // windows
  process.on('SIGBREAK', () => handleSig.apply(handleSig, [cnx]))
}

function handleSig(cnx: WS) {
  console.log('closing connection')

  // tell server to clear connection
  cnx && cnx.terminate()
}
