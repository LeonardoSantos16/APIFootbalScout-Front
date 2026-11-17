const LOCALE = 'pt-BR'

export const formatDecimal = (valor: number, casas: number): string =>
  new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor)

export const formatPercent = (valor: number): string => `${formatDecimal(valor, 1)}%`

export const formatMinutos = (minutos: number): string =>
  `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 }).format(minutos)} min`
