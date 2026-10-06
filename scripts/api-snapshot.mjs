import { writeFileSync } from 'node:fs'

process.env.NODE_TLS_REJECT_UNAUTHORIZED ??= '0'

const origin = process.argv[2] ?? 'https://localhost:7163'
const response = await fetch(`${origin}/openapi/v1.json`)
if (!response.ok) throw new Error(`${origin} responded with ${response.status}`)

const spec = await response.json()
delete spec.servers

writeFileSync('openapi/v1.json', `${JSON.stringify(spec, null, 2)}\n`)
