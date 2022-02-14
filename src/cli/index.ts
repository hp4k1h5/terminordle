#!/usr/bin/env node

export { display, infoIndex, MsgColors } from './printer'
export { repl } from './repl'

// entrypoint for cli
import './args'
