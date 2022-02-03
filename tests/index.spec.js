import { expect } from 'chai'

import { wordToRow, validateResponse, evaluateGuess, isCorrect } from '../src'
import { letters } from '../src/util'

describe('src/index', function () {
  describe('wordToRow()', function () {
    it('returns a Row from string', function () {
      expect(wordToRow('hello')).to.deep.equal([
        { letter: 'h', visibility: 'hidden' },
        { letter: 'e', visibility: 'hidden' },
        { letter: 'l', visibility: 'hidden' },
        { letter: 'l', visibility: 'hidden' },
        { letter: 'o', visibility: 'hidden' },
      ])
    })
  })

  describe('validateResponse()', function () {
    it('throws if input is not a Message', function () {
      expect(() => validateResponse('a')).to.throw('bad guess')
    })

    it('throws if message.content is invalid', function () {
      expect(() => validateResponse({ badKey: 'a' }).to.throw('bad guess'))
      expect(() => validateResponse({ content: 'a' }).to.throw('bad guess'))
      expect(() => validateResponse({ content: '42422' }).to.throw('bad guess'))
      expect(() => validateResponse({ content: 'asdfa' }).to.throw('bad guess'))
    })

    it('does not throw if input is valid', function () {
      expect(() => validateResponse({ content: 'hello' })).to.not.throw()
    })
  })

  describe('evaluateGuess()', function () {
    it('updates a good guess', function () {
      const goodGuess = wordToRow('guess')
      const answer = wordToRow('guess')
      evaluateGuess(goodGuess, answer)
      expect(goodGuess).to.deep.equal([
        { letter: 'g', visibility: 'revealed' },
        { letter: 'u', visibility: 'revealed' },
        { letter: 'e', visibility: 'revealed' },
        { letter: 's', visibility: 'revealed' },
        { letter: 's', visibility: 'revealed' },
      ])
    })

    it('updates a partially correct guess with repeated letters', function () {
      const guess = wordToRow('sassy')
      const answer = wordToRow('guess')
      evaluateGuess(guess, answer)
      expect(guess).to.deep.equal([
        { letter: 's', visibility: 'exists' },
        { letter: 'a', visibility: 'guessed' },
        { letter: 's', visibility: 'guessed' },
        { letter: 's', visibility: 'revealed' },
        { letter: 'y', visibility: 'guessed' },
      ])
    })

    it('updates a partially correct guess', function () {
      const badGuess = wordToRow('gassy')
      const answer = wordToRow('guess')
      evaluateGuess(badGuess, answer)
      expect(badGuess).to.deep.equal([
        { letter: 'g', visibility: 'revealed' },
        { letter: 'a', visibility: 'guessed' },
        { letter: 's', visibility: 'exists' },
        { letter: 's', visibility: 'revealed' },
        { letter: 'y', visibility: 'guessed' },
      ])
    })
  })

  describe('updateAlphabet()', function () {
    it('updates the alphabet', function () {
      const guess = wordToRow('stags')
      const answer = wordToRow('guess')
      evaluateGuess(guess, answer)
      expect(letters).to.deep.equal({
        a: 'guessed',
        b: 'hidden',
        c: 'hidden',
        d: 'hidden',
        e: 'revealed',
        f: 'hidden',
        g: 'revealed',
        h: 'hidden',
        i: 'hidden',
        j: 'hidden',
        k: 'hidden',
        l: 'hidden',
        m: 'hidden',
        n: 'hidden',
        o: 'hidden',
        p: 'hidden',
        q: 'hidden',
        r: 'hidden',
        s: 'revealed',
        t: 'guessed',
        u: 'revealed',
        v: 'hidden',
        w: 'hidden',
        x: 'hidden',
        y: 'guessed',
        z: 'hidden',
      })
    })
  })

  describe('isCorrect()', function () {
    it('is false when not correct', function () {
      const guess = wordToRow('stags')
      const answer = wordToRow('guess')
      evaluateGuess(guess, answer)
      expect(isCorrect(guess)).to.equal(false)
    })

    it('is true when correct', function () {
      const guess = wordToRow('guess')
      const answer = wordToRow('guess')
      evaluateGuess(guess, answer)
      expect(isCorrect(guess)).to.equal(true)
    })
  })
})
