import * as parsing from '~/parsing'

test('can parse numbers', () => {
  const state = { cursor: 0 }
  const input = '123  '

  const number = parsing.parseNumber(input, state)

  expect(number).toEqual('123')
  expect(state.cursor).toEqual(3)
})

test('can parse ratio', () => {
  const state = { cursor: 0 }
  const input = '1/2'
  const ratio = parsing.parseRatio(input, state)
  expect(ratio).toEqual('1/2')
  expect(state.cursor).toEqual(3)
})

test('can parse ratio with white space', () => {
  const state = { cursor: 0 }
  const input = '1   /    2'
  const ratio = parsing.parseRatio(input, state)
  expect(ratio).toEqual(input)
  expect(state.cursor).toEqual(input.length)
})

test('parse config', () => {
  const state = { cursor: 0 }
  const input = `
    config(
      mobile 20px "1",
      desktop 30px "2",
    )
  `.trim()

  const result = parsing.parseConfig(input, state)

  expect(result).toEqual(new Map([
    ['mobile', { gutterSize: '20px', mediaQuery: '1' }],
    ['desktop', { gutterSize: '30px', mediaQuery: '2' }],
  ]))
})

test('parse property', () => {
  const input = `
  to-lost(
    config(
      mobile 20px "1",
      desktop 30px "2",
    )
    1/3
    0
    mobile
  )
  `.trim()

  const result = parsing.parsePropertyValue(input)

  expect(result).toEqual({
    args: { ratio: '1/3', cycle: '0', mediaName: 'mobile' },
    rules: new Map([
      ['mobile', { gutterSize: '20px', mediaQuery: '1' }],
      ['desktop', { gutterSize: '30px', mediaQuery: '2' }],
    ]),
  })
})
