import { WebSocketServer } from 'ws'
import { Command, Argument } from 'commander'
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
  .command('join')
  .description(
    `${b`join`} ${y`[url]`} -s ${y`<session_id>`} or leave blank to create new
Exs:
terminordle join
terminordle join terminordle.fun -s session-name
terminordle join not-aserver.notatld:8080 -s random-words`,
  )
  .addArgument(
    new Argument('[url]', 'location of the terminordle server').default(
      'terminordle.fun',
    ),
  )
  .option('-s, --session <session_id>', 'join session with id')
  .action(async (url, options) => {
    const cnx = await requestSession(url, options.session)
    setSignals()
    await repl(cnx)
  })

export let wss: WebSocketServer
program
  .command('serve')
  .description(`${b`serve`} terminordle on ${y`[port]`}`)
  .addArgument(new Argument('[port]', 'port to listen on').default(8080))
  .option('-h, --host <host>', 'specify hostname', 'localhost')
  .option(
    '-l, --logfile [filepath]',
    'specify logfile path',
    '/tmp/terminordle-log.jsonl',
  )
  .action((port, options) => {
    let log: Log | undefined
    if (options.logfile) {
      log = new Log(options.logfile, true)
    }
    wss = createWSS(port, options.host, log)

    setImmediate(() => {
      console.log('serving...', wss.address())
      console.log('see log @', options.logfile)
      log && log.log({ 'serving...': wss.address() })
    })
  })

program.parse(process.argv)

//colors
function b(txt: TemplateStringsArray) {
  return chalk.blueBright(txt)
}
function y(txt: TemplateStringsArray) {
  return chalk.yellowBright(txt)
}
