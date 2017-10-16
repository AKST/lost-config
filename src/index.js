import * as postcss from 'postcss'
import { parsePropertyValue } from '~/parsing'


export function withRule (rule) {
  for (let i = 0; i < rule.nodes.length; i++) {
    const node = rule.nodes[i]
    if (node.type !== 'decl') continue
    if (node.prop !== 'lost-config') continue

    const expand = parsePropertyValue(node.value)
    const { mediaName, ratio, cycle } = expand.args
    const mediaConfig = expand.rules.get(mediaName)
    if (mediaConfig == null) throw Error(`unknown media, ${mediaName}`)

    const { gutterSize, mediaQuery } = mediaConfig

    const clone = node.clone()
    clone.value = `${ratio} ${cycle} ${gutterSize}`
    // Transform each property declaration here
    clone.prop = 'lost-column'

    rule.nodes[i] = postcss.atRule({
      name: 'media',
      params: mediaQuery,
      nodes: [clone],
    })
  }
}


export default postcss.plugin('lost-config', (options = {}) => {
  return root => root.walkRules(withRule)
})

