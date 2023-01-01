//@ts-strict
import { Visibility, Option, Row, ServerMessage } from './lib/structs'
import { words, letters } from './util'

export function wordToRow(word: string): Array<Option> {
  return word.split('').map(letter => ({
    letter,
    visibility: Visibility.hidden,
  }))
}

export function validateResponse(response: ServerMessage): void {
  if (!response.content || typeof response.content !== 'string') {
    throw 'bad guess'
  } else if (/[^a-z]/i.test(response.content)) {
    throw 'only a-zA-Z'
  } else if (response.content.length !== 5) {
    throw '5 letters only'
  } else if (!words[response.content.toLocaleLowerCase()]) {
    throw 'not in wordlist'
  }
}

// update guess and alphabet Rows in place
// each guess is a new object
// alphabet (letters) is a global
export function evaluateGuess(guess: Row, answer: Row): void {
  // update guess Row status
  guess.forEach((option: Option, i: number) => {
    const oL = option.letter.toLocaleLowerCase()
    const aL = answer[i].letter.toLocaleLowerCase()
    if (oL === aL) {
      option.visibility = Visibility.revealed
    } else if (letterExists(guess, i, answer)) {
      option.visibility = Visibility.exists
    } else {
      option.visibility = Visibility.guessed
    }

    // update alphabet Row status
    if (letters[oL] !== Visibility.revealed) letters[oL] = option.visibility
  })
}

// update alphabet when the evaluated guess comes from server
export function updateAlphabet(guess: Row): void {
  guess.forEach((option: Option) => {
    const oL = option.letter.toLocaleLowerCase()
    if (letters[oL] !== Visibility.revealed) {
      letters[oL] = option.visibility
    }
  })
}

// determine whether to mark a letter exists (yellow)
// i.e. whether the letter
//   - exists somewhere in the answer
//   - does not exist in that position
//   - is not already accounted for by previous guess instances of the letter
function letterExists(guess: Row, i: number, answer: Row): boolean {
  const option = guess[i]
  if (!answer.find(l => l.letter === option.letter)) {
    return false
  }

  // get intersection of letter instances in guess and answer
  function sameLetterIndices(row: Row): number[] {
    return row.slice().reduce((a: number[], v, j) => {
      if (v.letter === option.letter) {
        a.push(j)
      }
      return a
    }, [])
  }
  const sameAnswerLetterIndices = sameLetterIndices(answer)
  const sameGuessLetterIndices = sameLetterIndices(guess)
  const intersection = sameAnswerLetterIndices.filter(
    i => !sameGuessLetterIndices.includes(i),
  )

  // get difference between needed instances of the letter and provided
  // instances
  sameGuessLetterIndices.forEach(i => {
    if (guess[i].visibility === Visibility.exists) {
      intersection.shift()
    }
  })

  // there are unaccounted for instances
  if (intersection.length) {
    return true
  }

  // there are too many instances
  return false
}

// this does not check against the answer because in a client-server model the
// client never receives the answer, only the evaluated guess
export function isCorrect(guess: Row): boolean {
  if (guess.some(letter => letter.visibility !== Visibility.revealed)) {
    return false
  }
  return true
}
