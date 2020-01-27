require('mocha')
const { expect } = require("chai")
const { reverseTransposeMat4, transposeMat4 } = require("./constants")

describe('constant.js', () => {
  describe('reverseTransposeMat4', () => {
    it('should convert array of array to single array with correct format', () => {
      const input = [
        [ 0,    0.1,  0,    100],
        [ 0.2,  0,    0,    200],
        [ 0,    0,    0.3,  300],
        [0 , 0, 0, 1]
      ]
      const expected = [0, 0.2, 0, 0, 0.1, 0, 0, 0, 0, 0, 0, 0.3, 0, 100, 200, 300, 1]
      expect(
        reverseTransposeMat4(input)
      ).to.equal(expected)
    })
  })
})
