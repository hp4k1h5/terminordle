import * as process from 'process'

export { display } from './printer'
export { repl } from './repl'
import './args'

export function setSignals(cnx) {
  process.stdin.resume()

  // default
  process.on('SIGINT', handleSig)
  // windows
  process.on('SIGBREAK', handleSig)
}

function handleSig(cnx) {
  console.log('closing connection')
  // tell server to clear connection
  cnx.terminate()
}
