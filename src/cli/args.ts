import { Command } from 'commander'
import * as chalk from 'chalk'

import { createWSS, requestSession } from '../ws'
import { setSignals, repl } from '../cli'
import { version } from '../../package.json'

const program = new Command()
program.version(version)

program
  .command('play')
  .description(`${b`play`} terminordle locally`)
  .action(async () => {
    setTimeout(async () => {
      await repl()
    }, 0)
  })

program
  .command('join [session_id]')
  .description(`${b`join`} ${y`[session_id]`} or leave blank to create new`)
  .action(async session_id => {
    const cnx = await requestSession(session_id)
    setSignals(cnx)
    await repl(cnx)
  })

export let wss
program
  .command('serve [port]')
  .description(`${b`serve`} terminordle on ${y`[port]`}`)
  .action((port = 8080) => {
    wss = createWSS(port)
    console.log('serving...', wss.address())
  })

program.parse(process.argv)

//colors
function b(txt) {
  return chalk.blueBright(txt)
}
function y(txt) {
  return chalk.yellowBright(txt)
}
