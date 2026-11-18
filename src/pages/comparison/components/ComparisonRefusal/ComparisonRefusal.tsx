import type { ReactNode } from 'react'
import type { RefusedPlayer } from '../../interfaces/comparison'
import styles from './ComparisonRefusal.module.css'

interface ComparisonRefusalProps {
  players: [RefusedPlayer, RefusedPlayer]
  message: string
  action: ReactNode
}

export const ComparisonRefusal = ({ players, message, action }: ComparisonRefusalProps) => (
  <div className={styles.refusal}>
    <ul className={styles.players} aria-label="Jogadores comparados">
      {players.map((player, index) => (
        <li key={index} className={styles.player}>
          <span className={styles.name}>{player.name}</span>
          <span className={styles.position}>{player.position}</span>
        </li>
      ))}
    </ul>
    <p className={styles.message}>{message}</p>
    <div>{action}</div>
  </div>
)
