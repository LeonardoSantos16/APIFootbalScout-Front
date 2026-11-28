import type { ShortlistResponse } from '../../interfaces/shortlist'
import { ShortlistNameForm } from '../ShortlistNameForm/ShortlistNameForm'
import styles from './AddToShortlist.module.css'

interface FirstShortlistProps {
  playerName: string
  onCreated: (shortlist: ShortlistResponse) => void
}

export const FirstShortlist = ({ playerName, onCreated }: FirstShortlistProps) => (
  <div className={styles.body}>
    <p className={styles.text}>{`Você ainda não tem shortlist. Crie uma para adicionar ${playerName}.`}</p>
    <ShortlistNameForm stacked onCreated={onCreated} />
  </div>
)
