#!/usr/bin/env node
import * as process from 'process'

import { WS } from '../lib/structs'
export { display, infoIndex, MsgColors } from './printer'
export { repl } from './repl'
import './args'

export function setSignals() {
  process.stdin.resume()

  // default
  process.on('SIGINT', handleSig)
  // windows
  process.on('SIGBREAK', handleSig)
}

function handleSig(cnx: WS) {
  console.log('closing connection')
  // tell server to clear connection
  cnx.terminate()
}
