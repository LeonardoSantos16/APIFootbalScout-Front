import { AMOSTRA_MINIMA_DE_MINUTOS } from '../../../config/scout'
import { formatDecimal, formatMinutos, formatPercent } from '../../../utils/numero'
import type { Atributo, LinhaDeMetrica, MetricasPor90, TipoDeAtributo } from '../interfaces/metricas'

export class RespostaIncompletaError extends Error {
  constructor(tipo: TipoDeAtributo) {
    super(`Atributo ausente ou sem valor: ${tipo}`)
    this.name = 'RespostaIncompletaError'
  }
}

export const TIPOS_EM_ORDEM: TipoDeAtributo[] = [
  'Gols',
  'Assistencias',
  'PassesDecisivos',
  'Desarmes',
  'Interceptacoes',
  'Rating',
  'PrecisaoDePasse',
]

export const ROTULO_DO_TIPO: Record<TipoDeAtributo, string> = {
  Gols: 'Gols, por 90',
  Assistencias: 'Assistências, por 90',
  PassesDecisivos: 'Passes decisivos, por 90',
  Desarmes: 'Desarmes, por 90',
  Interceptacoes: 'Interceptações, por 90',
  Rating: 'Nota, média',
  PrecisaoDePasse: 'Precisão de passe',
}

const formatarValor = (tipo: TipoDeAtributo, valor: number) =>
  tipo === 'PrecisaoDePasse' ? formatPercent(valor) : formatDecimal(valor, 2)

const MINIMO = formatMinutos(AMOSTRA_MINIMA_DE_MINUTOS)

export const textoDaRecusa = (atributo: Atributo): string => {
  if (atributo.motivo === 'FonteNaoAtribuiu') return 'Não publicado pela fonte'
  if (atributo.amostraEmMinutos == null) return `Amostra insuficiente: mínimo de ${MINIMO}`
  const amostra = formatDecimal(atributo.amostraEmMinutos, 0)
  return `Amostra insuficiente: ${amostra} de ${MINIMO}`
}

export const amostraDoRodape = (atributos: Atributo[]): number | undefined => {
  const contagem = new Map<number, number>()
  for (const { amostraEmMinutos } of atributos) {
    if (amostraEmMinutos == null) continue
    contagem.set(amostraEmMinutos, (contagem.get(amostraEmMinutos) ?? 0) + 1)
  }
  const [maisComum] = [...contagem].sort(([amostraA, vezesA], [amostraB, vezesB]) =>
    vezesB - vezesA || amostraB - amostraA,
  )
  return maisComum?.[0]
}

const REGRA_DO_MINIMO = `Contagens por 90 minutos; métricas com menos de ${MINIMO} ficam sem valor.`

export const textoDoRodape = (amostra?: number): string =>
  amostra == null ? REGRA_DO_MINIMO : `Amostra: ${formatMinutos(amostra)} jogados. ${REGRA_DO_MINIMO}`

const montarLinha = (atributo: Atributo, amostraComum: number | undefined): LinhaDeMetrica => {
  const { tipo } = atributo
  const rotulo = ROTULO_DO_TIPO[tipo]

  if (atributo.resultado === 'Recusada') {
    return { tipo, rotulo, recusada: true, texto: textoDaRecusa(atributo) }
  }

  if (atributo.valor == null) throw new RespostaIncompletaError(tipo)

  const amostraPropria = atributo.amostraEmMinutos
  const amostra =
    amostraPropria != null && amostraPropria !== amostraComum
      ? `${formatMinutos(amostraPropria)} jogados`
      : undefined

  return { tipo, rotulo, recusada: false, texto: formatarValor(tipo, atributo.valor), amostra }
}

export const montarLinhas = (resposta: MetricasPor90): LinhaDeMetrica[] => {
  const amostraComum = amostraDoRodape(resposta.atributos)

  return TIPOS_EM_ORDEM.map((tipo) => {
    const atributo = resposta.atributos.find((item) => item.tipo === tipo)
    if (!atributo) throw new RespostaIncompletaError(tipo)
    return montarLinha(atributo, amostraComum)
  })
}
