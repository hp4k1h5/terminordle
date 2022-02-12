//@ts-strict
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'
import * as process from 'process'

import { AddressInfo } from 'ws'

const dirname = process.cwd()

export function fp(relPath: string) {
  if (path.isAbsolute(relPath)) {
    return relPath
  }
  return path.resolve(path.join(dirname, relPath))
}

type Line = { [key: string]: string | Date | AddressInfo | number | undefined }

export class Log {
  filepath: string
  logger
  reader
  constructor(relPath: string, overwrite = true) {
    this.filepath = fp(relPath)

    this.logger = (function (_this: Log) {
      if (!fs.existsSync(_this.filepath) || overwrite) {
        const dirname = path.dirname(_this.filepath)
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true })
        }
        fs.openSync(_this.filepath, 'w')
        fs.writeFileSync(_this.filepath, '')
      }

      return fs.createWriteStream(_this.filepath, {
        flags: overwrite ? 'r+' : 'a+',
      })
    })(this)

    this.reader = readline.createInterface({
      input: fs.createReadStream(this.filepath, {}),
    })
  }

  log(line: Line) {
    line.timestamp = new Date()
    this.logger.write(JSON.stringify(line) + '\n')
  }

  read() {
    async function* read(_this: Log) {
      for await (let line of _this.reader) {
        line = JSON.parse(line)
        yield line
      }
    }
    return read(this)
  }
}
