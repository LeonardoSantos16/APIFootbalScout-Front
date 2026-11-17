import type { Atributo, LinhaDeMetrica, MetricasPor90, TipoDeAtributo } from '../interfaces/metricas'

export class RespostaIncompletaError extends Error {
  constructor(tipo: TipoDeAtributo) {
    super(`Atributo ausente ou sem valor: ${tipo}`)
    this.name = 'RespostaIncompletaError'
  }
}

export const TIPOS_EM_ORDEM: TipoDeAtributo[] = []

export const ROTULO_DO_TIPO = {} as Record<TipoDeAtributo, string>

export const montarLinhas = (_resposta: MetricasPor90): LinhaDeMetrica[] => []

export const amostraDoRodape = (_atributos: Atributo[]): number | undefined => undefined

export const textoDoRodape = (_amostra?: number): string => ''

export const textoDaRecusa = (_atributo: Atributo): string => ''
