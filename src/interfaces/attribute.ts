import type { components } from '../api/schema'

type Schemas = components['schemas']

export type Attribute = Schemas['AtributoDto']

export type AttributeType = Schemas['TipoDeAtributoDto']
