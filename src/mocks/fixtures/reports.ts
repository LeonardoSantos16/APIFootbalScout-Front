import type { components } from '../../api/schema'

type Report = components['schemas']['RelatorioResponseDto']

export const REPORT_IDS = {
  original: '10010000-0000-4000-8000-000000000001',
  correction: '10010000-0000-4000-8000-000000000002',
  correctionDraft: '10010000-0000-4000-8000-000000000003',
  looseDraft: '10010000-0000-4000-8000-000000000004',
  current1002: '10020000-0000-4000-8000-000000000001',
  draft1005: '10050000-0000-4000-8000-000000000001',
  missing: '99990000-0000-4000-8000-000000000001',
} as const

export const day = (date: string) => `${date}T12:00:00Z`

export const buildReport = (overrides: Partial<Report> & Pick<Report, 'relatorioId' | 'jogadorId'>): Report => ({
  status: 'Rascunho',
  texto: 'Jogo contra o Vila Nova, 90 minutos como segundo volante.',
  observadoEm: day('2026-11-20'),
  escritoEm: day('2026-11-20'),
  pontosPositivos: [],
  pontosNegativos: [],
  version: 1,
  ...overrides,
})

export const originalReport = (): Report =>
  buildReport({
    relatorioId: REPORT_IDS.original,
    jogadorId: 1001,
    status: 'Finalizado',
    texto: 'Primeiro jogo observado, contra o Serra Azul. Bom posicionamento, pouca agressividade.',
    observadoEm: day('2026-11-02'),
    escritoEm: day('2026-11-03'),
    finalizadoEm: day('2026-11-03'),
    nota: 6.5,
    parecer: 'Monitorar',
    pontosPositivos: ['Bom posicionamento sem a bola', 'Passe curto seguro'],
    pontosNegativos: ['Pouca agressividade na marcação', 'Some no segundo tempo'],
    version: 4,
  })

export const correctionReport = (): Report =>
  buildReport({
    relatorioId: REPORT_IDS.correction,
    jogadorId: 1001,
    status: 'Finalizado',
    texto: 'Revendo o jogo contra o Serra Azul: a agressividade foi tática, pedida pelo técnico.',
    observadoEm: day('2026-11-02'),
    escritoEm: day('2026-11-05'),
    finalizadoEm: day('2026-11-05'),
    nota: 7.5,
    parecer: 'Contratar',
    pontosPositivos: ['Bom posicionamento sem a bola', 'Leitura tática'],
    pontosNegativos: ['Pouco jogo aéreo', 'Some no segundo tempo'],
    corrigeRelatorioId: REPORT_IDS.original,
    version: 3,
  })

export const correctionDraftReport = (): Report =>
  buildReport({
    relatorioId: REPORT_IDS.correctionDraft,
    jogadorId: 1001,
    texto: 'Revendo o jogo contra o Serra Azul: a agressividade foi tática, pedida pelo técnico.',
    observadoEm: day('2026-11-02'),
    escritoEm: day('2026-11-12'),
    corrigeRelatorioId: REPORT_IDS.correction,
  })

export const looseDraftReport = (): Report =>
  buildReport({
    relatorioId: REPORT_IDS.looseDraft,
    jogadorId: 1001,
    texto: 'Jogo contra o Vila Nova, 90 minutos como segundo volante. Boa leitura entre as linhas.',
    observadoEm: day('2026-11-20'),
    escritoEm: day('2026-11-20'),
    nota: 7.5,
    parecer: 'Monitorar',
    pontosPositivos: ['Recebe de costas e gira rápido'],
    version: 2,
  })

export const currentReport1002 = (): Report =>
  buildReport({
    relatorioId: REPORT_IDS.current1002,
    jogadorId: 1002,
    status: 'Finalizado',
    texto: 'Clássico estadual, titular como lateral esquerdo. Apoio constante, cruzamentos de primeira.',
    observadoEm: day('2026-11-14'),
    escritoEm: day('2026-11-16'),
    finalizadoEm: day('2026-11-16'),
    nota: 8,
    parecer: 'Contratar',
    pontosPositivos: ['Cruzamento de primeira', 'Fôlego até o fim'],
    pontosNegativos: ['Recomposição lenta', 'Pouco jogo por dentro'],
    version: 5,
  })

export const draftReport1005 = (): Report =>
  buildReport({
    relatorioId: REPORT_IDS.draft1005,
    jogadorId: 1005,
    texto: 'Jogo da Copa do Brasil, entrou no intervalo.',
    observadoEm: day('2026-11-18'),
    escritoEm: day('2026-11-18'),
    version: 2,
  })

export const seededReports = (): Report[] => [
  originalReport(),
  correctionReport(),
  correctionDraftReport(),
  looseDraftReport(),
  currentReport1002(),
  draftReport1005(),
]
