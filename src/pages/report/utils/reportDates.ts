const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

const pad = (value: number) => String(value).padStart(2, '0')

const inputOf = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const offsetOf = (date: Date) => {
  const minutes = -date.getTimezoneOffset()
  const sign = minutes >= 0 ? '+' : '-'
  const absolute = Math.abs(minutes)
  return `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`
}

export const todayInput = (): string => inputOf(new Date())

export const toInputDate = (iso: string): string => inputOf(new Date(iso))

export const observationToApi = (date: string): string => {
  const [year, month, day] = date.split('-').map(Number)
  return `${date}T00:00:00${offsetOf(new Date(year, month - 1, day))}`
}

export const formatDate = (iso: string): string => DATE_FORMAT.format(new Date(iso))
