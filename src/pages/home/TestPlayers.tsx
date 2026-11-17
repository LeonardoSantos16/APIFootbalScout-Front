import { Link } from '@tanstack/react-router'
import styles from './HomePage.module.css'

const TEST_PLAYERS = [
  { id: 1001, scenario: 'Clube e seleção, com recusas' },
  { id: 1002, scenario: 'Só seleção' },
  { id: 1003, scenario: 'Sem estatísticas' },
  { id: 1004, scenario: 'Perfil não encontrado' },
  { id: 1005, scenario: 'Métricas fora do ar' },
]

export const TestPlayers = () => (
  <>
    <ul className={styles.players}>
      {TEST_PLAYERS.map(({ id, scenario }) => (
        <li key={id}>
          <Link
            className={styles.player}
            to="/jogadores/$jogadorId/metricas"
            params={{ jogadorId: String(id) }}
            search={{ competicao: undefined, temporada: undefined, contexto: undefined }}
          >
            <span>{id}</span>
            <span className={styles.scenario}>{scenario}</span>
          </Link>
        </li>
      ))}
    </ul>
    <p className={styles.note}>Só no dev:mock. Abre as métricas por 90 do jogador.</p>
  </>
)
