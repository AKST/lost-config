// @flow

const EXPAND_FN_NAME = 'to-lost'
const CONFIG_FN_NAME = 'config'
const IDENTIFIER_REGEX = /^[A-z][A-z0-9_-]*/
const RATIO_REGEX = /^(\d+)\s*\/\s*(\d+)/
const UNIT_REGEX = /(px)|(vw)|(vh)|(em)|(vmax)|(rem)/

type State = { cursor: number }
type MediaConfig = { gutterSize: string, mediaQuery: string }
type MediaConfigMap = Map<string, MediaConfig>

export type LostConfig = {
  args: { cycle: string, mediaName: string, ratio: string },
  rules: MediaConfigMap,
}


export function parsePropertyValue (input: string): LostConfig {
  let state = { cursor: 0 }

  skipWhitespace(input, state)
  if (! skipNextIf(input, state, EXPAND_FN_NAME)) throw new Error('expected lost-expand')

  skipWhitespace(input, state)
  if (! skipNextIf(input, state, '(')) throw new Error('expected opening paren')

  skipWhitespace(input, state)
  const rules = parseConfig(input, state)

  skipWhitespace(input, state)
  const ratio = parseRatio(input, state)

  skipWhitespace(input, state)
  const cycle = parseNumber(input, state)

  skipWhitespace(input, state)
  const mediaName = parseIndentifier(input, state)

  skipWhitespace(input, state)
  if (! skipNextIf(input, state, ')')) throw new Error('expected closing paren')

  return { rules, args: { mediaName, ratio, cycle } }
}

export function parseConfig (input: string, state: State): MediaConfigMap {
  if (! skipNextIf(input, state, CONFIG_FN_NAME)) throw new Error('expected lost-config')

  skipWhitespace(input, state)
  if (! skipNextIf(input, state, '(')) throw new Error('expected opening paren')

  const config = parseConfigRules(input, state)
  if (! skipNextIf(input, state, ')')) throw new Error('expected closing paren')

  return config
}

function parseConfigRules (input: string, state: State): MediaConfigMap {
  const rules = new Map()

  skipWhitespace(input, state)

  while (input[state.cursor] !== ')') {
    const mediaName = parseIndentifier(input, state)

    skipWhitespace(input, state)
    const gutterSize = parseUnit(input, state)

    skipWhitespace(input, state)
    const mediaQuery = parseString(input, state)

    skipWhitespace(input, state)
    if (skipNextIf(input, state, ',')) skipWhitespace(input, state)

    rules.set(mediaName, { gutterSize, mediaQuery })
  }

  return rules
}

/**
 * Parses an identifer used to denote a media query.
 *
 * @param input - The total input of the program.
 * @param state - Current parse state.
 */
export function parseIndentifier (input: string, state: State) {
  return parseRegex(input, state, IDENTIFIER_REGEX, 'media-name')[0]
}

/**
 * Parses a ratio used to express now much of a grid row
 * is occupied.
 *
 * @param input - The total input of the program.
 * @param state - Current parse state.
 */
export function parseRatio (input: string, state: State) {
  return parseRegex(input, state, RATIO_REGEX, 'ratio')[0]
}

// util

/**
 * Parses strings, but returns the inside contents of
 * it without the quotes.
 *
 * @param input - The total input of the program.
 * @param state - Current parse state.
 */
export function parseString (input: string, state: State): string {
  const head = input[state.cursor]
  const start = state.cursor

  if (head !== "'" && head !== '"') {
    throw new Error('expected opening quote')
  }

  while (true) {
    state.cursor += 1
    const current = input[state.cursor]

    if (current === head) {
      const last = input[state.cursor - 1]
      if (last !== '\\') break
    }
  }

  state.cursor += 1
  return input.slice(start + 1, state.cursor - 1)
}

/**
 * Parses units of stuff.
 *
 * @param input - The total input of the program.
 * @param state - Current parse state.
 */
export function parseUnit (input: string, state: State): string {
  const number = parseNumber(input, state)
  const unitType = parseRegex(input, state, UNIT_REGEX)[0]
  return `${number}${unitType}`
}

/**
 * Used to parse a number.
 *
 * @param input - The total input of the program.
 * @param state - Current parse state.
 */
export function parseNumber (input: string, state: State): string {
  const ZERO = 48
  const NINE = 57
  const start = state.cursor

  while (isBetween(input.charCodeAt(state.cursor), ZERO, NINE)) {
    state.cursor += 1
  }

  if (start === state.cursor) throw new Error('failed to parse number')

  return input.slice(start, state.cursor)
}

export function parseRegex (
    input: string,
    state: State,
    regex: RegExp,
    name: string = 'token',
    dropIndex: number = 0
) {
  const slice = input.slice(state.cursor)
  const match = slice.match(regex)
  if (match == null) throw new Error(`failed to match ${name}`)
  if (dropIndex in match) state.cursor += match[dropIndex].length
  return match
}

export function skipWhitespace (input: string, state: State) {
  const isWhitespace = char => [' ', '\n', '\t'].includes(char)
  while (isWhitespace(input[state.cursor])) state.cursor += 1
}

function skipNextIf (input: string, state: State, value: string): boolean {
  const slice = input.substr(state.cursor, value.length)
  if (slice !== value) return false
  state.cursor += value.length
  return true
}

function isBetween (num: number, start: number, end: number) {
  return num >= start && num <= end
}

