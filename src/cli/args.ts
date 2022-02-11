//@ts-strict
import { WebSocketServer } from 'ws'
import { Command } from 'commander'
import * as chalk from 'chalk'

import { createWSS, requestSession } from '../ws'
import { setSignals, repl } from '../cli'
import { Log } from '../util'
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
  .command('join <address>')
  .option('-s, --session <session_id>', 'join session with id')
  .description(`${b`join`} ${y`s session_id`} or leave blank to create new`)
  .action(async (address, options) => {
    const cnx = await requestSession(address, options.session)
    setSignals()
    await repl(cnx)
  })

export let wss: WebSocketServer
program
  .command('serve [port]')
  .option('-l, --logfile [filepath]', 'specify logfile path')
  .description(`${b`serve`} terminordle on ${y`[port]`}`)
  .action((port = 8080, options) => {
    const log: Log = new Log(options.logfile, true)
    wss = createWSS(port, log)

    console.log('serving...', wss.address())
    log.log({ 'serving...': wss.address() })
  })

program.parse(process.argv)

//colors
function b(txt: TemplateStringsArray) {
  return chalk.blueBright(txt)
}
function y(txt: TemplateStringsArray) {
  return chalk.yellowBright(txt)
}
