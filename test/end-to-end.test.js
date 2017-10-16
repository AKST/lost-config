import * as postcss from 'postcss'
import { withRule } from '~/index'

test('end to end test', () => {
  const media = 'only screen and (min-width: 300px)'

  const rule = postcss.rule({
    nodes: [
      postcss.decl({
        prop: 'lost-config',
        value: `
          to-lost(
            config(desktop 10px "${media}")
            1/3 0 desktop
          )
        `,
      }),
    ]
  })

  // should mutate the rule.
  withRule(rule)

  const firstChild = rule.nodes[0]
  expect(firstChild.type).toEqual('atrule')
  expect(firstChild.name).toEqual('media')
  expect(firstChild.params).toEqual(media)

  const firstMediaChlid = firstChild.nodes[0]
  expect(firstMediaChlid.type).toEqual('decl')
  expect(firstMediaChlid.prop).toEqual('lost-column')
  expect(firstMediaChlid.value).toEqual('1/3 0 10px')
})
