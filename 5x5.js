const fs = require('fs')
// let words = fs.readFileSync('./data/jr_300K_en-shuf.txt', 'utf8')
// const fives = words.split('\n').filter(w => w.length === 5)
// fs.writeFileSync('data/jr_5_en.txt', fives.join('\n'))
let words = fs.readFileSync('./data/jr_5_en.txt', 'utf8')
const fives = words
  .toLowerCase()
  .split('\n')
  .filter(word => {
    return (
      word &&
      /^(?!.*(.).*\1)\w+$/.test(word) &&
      !/[aeiouy].*[aeiouy]/.test(word)
    )
  })
console.log(fives.length)

let _5x5 = []
let i = 0
while (i++ < fives.length) {
  _5x5.push(fives[i])

  let diffLetters = true
  const block = []
  while (_5x5.length < 5 && diffLetters) {
    const re = new RegExp(`[${_5x5.join('')}]`)
    diffLetters = fives.find(f => {
      return !block.includes(f) && !re.test(f)
    })
    if (diffLetters) {
      _5x5.push(diffLetters)
    } else if (_5x5.length > 1) {
      block.push(_5x5.pop())
      diffLetters = true
    }
  }
  if (_5x5.length >= 3) {
    console.log(_5x5)
  }
  _5x5 = []
}
console.log(_5x5)
