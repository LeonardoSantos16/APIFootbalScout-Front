export const MENSAGEM_GENERICA = 'Não foi possível concluir agora.'

export const MENSAGEM_POR_CODE: Record<string, string> = {}

export interface ErroDescrito {
  mensagem: string
  podeRepetir: boolean
}

export interface OpcoesDeDescricao {
  textoPuro?: boolean
}

export const describeError = (_error: unknown, _opcoes: OpcoesDeDescricao = {}): ErroDescrito => ({
  mensagem: '',
  podeRepetir: false,
})
