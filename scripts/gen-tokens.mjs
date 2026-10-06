import { readFileSync, writeFileSync } from 'node:fs'

const tokens = JSON.parse(readFileSync('docs/design-system/tokens.json', 'utf8'))

const colors = new Map(tokens.color.tokens.map(({ name, value }) => [name, value]))
const resolve = (value) => value.replace(/^\{(.+)\}$/, (_, ref) => `var(--${ref})`)

const lines = [
  ...[...colors].map(([name, value]) => `--${name}: ${resolve(value)};`),
  `--font-display: ${tokens.type.families.display};`,
  `--font-body: ${tokens.type.families.body};`,
  ...tokens.type.groups.flatMap(({ family, styles }) =>
    styles.map(({ name, fontSize, lineHeight, fontWeight }) =>
      `--text-${name}: ${fontWeight} ${fontSize}/${lineHeight} var(--font-${family});`,
    ),
  ),
  ...tokens.spacing.tokens.map(({ name, value }) => `--${name}: ${value};`),
  ...tokens.radius.tokens.map(({ name, value }) => `--${name}: ${value};`),
]

writeFileSync('src/styles/tokens.css', `:root {\n${lines.map((line) => `  ${line}`).join('\n')}\n}\n`)
