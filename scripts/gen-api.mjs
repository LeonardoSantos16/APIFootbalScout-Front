import { readFileSync, writeFileSync } from 'node:fs'
import openapiTS, { astToString } from 'openapi-typescript'

const spec = JSON.parse(readFileSync('openapi/v1.json', 'utf8'))

for (const [route, operations] of Object.entries(spec.paths)) {
  const segments = Array.from(route.matchAll(/\{(\w+)\}/g), ([, name]) => name)
  for (const operation of Object.values(operations)) {
    for (const parameter of operation.parameters ?? []) {
      if (parameter.in !== 'path') continue
      const segment = segments.find((name) => name.toLowerCase() === parameter.name.toLowerCase())
      if (segment) parameter.name = segment
    }
  }
}

const ast = await openapiTS(spec)
writeFileSync('src/api/schema.d.ts', astToString(ast))
