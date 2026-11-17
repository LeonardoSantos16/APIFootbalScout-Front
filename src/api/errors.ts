import { ApiError } from './client'

export const MENSAGEM_GENERICA = 'Não foi possível concluir agora.'

export const MENSAGEM_POR_CODE: Record<string, string> = {
  'usuario.email_ja_cadastrado': 'Este e-mail já está cadastrado.',
  'usuario.credenciais_invalidas': 'E-mail ou senha incorretos.',
  'usuario.nao_encontrado': 'Usuário não encontrado.',
  'usuario.senha_atual_invalida': 'A senha atual está incorreta.',
  'usuario.senha_igual_a_atual': 'A nova senha precisa ser diferente da atual.',
  'usuario.refresh_token_invalido': 'Sua sessão expirou. Entre novamente.',
  'usuario.token_sem_identificacao': 'Sessão inválida. Entre novamente.',

  'acompanhamento.jogador_ja_acompanhado': 'Você já acompanha este jogador.',
  'acompanhamento.limite_atingido': 'Limite de 10 acompanhamentos atingido. Encerre um para abrir outro.',
  'acompanhamento.dossie_nao_encontrado': 'Nenhum acompanhamento ativo para este jogador.',
  'jogador.perfil_nao_encontrado': 'Não há dados deste jogador para a competição e temporada escolhidas.',
  'jogador.informacoes_insuficientes': 'O jogador não tem dados suficientes para servir de linha de base.',
  'jogador.estatisticas_nao_encontradas': 'Sem estatísticas para esta competição e temporada.',
  'dossie.ja_encerrado': 'Este acompanhamento já foi encerrado.',
  'dossie.encerrado_somente_leitura': 'Acompanhamento encerrado não pode ser alterado.',

  'relatorio.nao_encontrado': 'Relatório não encontrado.',
  'relatorio.jogador_invalido': 'Jogador inválido.',
  'relatorio.observacao_futura': 'A data da observação não pode estar no futuro.',
  'relatorio.texto_obrigatorio': 'O texto do relatório é obrigatório.',
  'relatorio.ja_finalizado': 'Relatório finalizado não pode ser editado. Crie uma correção.',
  'relatorio.correcao_de_rascunho': 'Só relatório finalizado pode ser corrigido.',
  'relatorio.conclusao_ausente': 'Preencha nota e parecer antes de finalizar.',
  'relatorio.conteudo_minimo_nao_atendido':
    'Inclua ao menos 2 pontos positivos e 2 negativos (20 caracteres no total).',
  'relatorio.parecer_invalido': 'Parecer inválido.',
  'nota.fora_da_faixa': 'A nota deve estar entre 0 e 10.',
  'nota.precisao_invalida': 'A nota aceita no máximo uma casa decimal.',

  'shortlist.nao_encontrada': 'Shortlist não encontrada.',
  'shortlist.alvo_nao_encontrado': 'Este jogador não está na shortlist.',
  'shortlist.jogador_ja_na_lista': 'Este jogador já está na shortlist.',
  'shortlist.limite_de_alvos_atingido': 'A shortlist atingiu o limite de 25 alvos.',
  'shortlist.prioridade_fora_da_ordem': 'Prioridade fora da ordem da lista.',
  'shortlist.moeda_divergente': 'Todos os custos da shortlist precisam usar a mesma moeda.',
  'prioridade.nao_positiva': 'A prioridade deve ser maior que zero.',
  'dinheiro.moedas_distintas': 'Não é possível somar valores em moedas diferentes.',

  'comparacao.jogador_consigo_mesmo': 'Escolha dois jogadores diferentes.',
  'recorte.contexto_invalido': 'Contexto inválido. Escolha clube ou seleção.',
  'posicao.invalida': 'Posição desconhecida.',
  'conjunto_de_estatisticas.vazio': 'Sem estatísticas para esta competição e temporada.',
  'conjunto_de_estatisticas.recorte_divergente': 'Estatísticas de competições ou temporadas diferentes.',
  'conjunto_de_estatisticas.minutagem_divergente': 'Minutagem inconsistente na fonte.',
  'janela_da_comparacao.intervalo_invalido': 'Intervalo de comparação inválido.',

  'sofascore.perfil_do_jogador_indisponivel': 'Não foi possível carregar o perfil agora.',
  'sofascore.detalhes_do_jogador_indisponiveis': 'Dados do jogador indisponíveis no momento.',
  'sofascore.estatisticas_do_jogador_indisponiveis': 'Estatísticas indisponíveis no momento.',
  'sofascore.historico_de_estatisticas_indisponivel': 'Histórico indisponível no momento.',
  'sofascore.historico_de_transferencias_indisponivel': 'Histórico de transferências indisponível.',
  'sofascore.temporadas_do_torneio_indisponiveis': 'Temporadas do torneio indisponíveis.',
}

const MENSAGEM_POR_STATUS_EM_TEXTO_PURO: Record<number, string> = {
  404: 'Jogador não encontrado.',
  502: 'Não foi possível carregar o perfil agora.',
}

export interface ErroDescrito {
  mensagem: string
  podeRepetir: boolean
}

export interface OpcoesDeDescricao {
  textoPuro?: boolean
}

interface CorpoDoProblema {
  code?: unknown
  instance?: unknown
}

const lerCorpo = (body: unknown): CorpoDoProblema =>
  typeof body === 'object' && body !== null ? (body as CorpoDoProblema) : {}

const ehErroDoCliente = (status: number) => status >= 400 && status < 500

const desconhecido = (error: unknown): ErroDescrito => {
  const status = error instanceof ApiError ? error.status : undefined
  const { instance } = error instanceof ApiError ? lerCorpo(error.body) : {}
  console.error('Erro desconhecido', typeof instance === 'string' ? instance : error)
  return {
    mensagem: MENSAGEM_GENERICA,
    podeRepetir: status === undefined || !ehErroDoCliente(status),
  }
}

export const describeError = (error: unknown, opcoes: OpcoesDeDescricao = {}): ErroDescrito => {
  if (!(error instanceof ApiError)) return desconhecido(error)

  const podeRepetir = error.status === 502
  const { code } = lerCorpo(error.body)

  if (typeof code === 'string') {
    const mensagem = MENSAGEM_POR_CODE[code]
    return mensagem ? { mensagem, podeRepetir } : desconhecido(error)
  }

  const mensagemPorStatus = opcoes.textoPuro ? MENSAGEM_POR_STATUS_EM_TEXTO_PURO[error.status] : undefined
  return mensagemPorStatus ? { mensagem: mensagemPorStatus, podeRepetir } : desconhecido(error)
}
