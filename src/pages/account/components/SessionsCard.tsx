import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import styles from '../AccountPage.module.css'

interface SessionsCardProps {
  onSignOutAll: () => void
}

export const SessionsCard = ({ onSignOutAll }: SessionsCardProps) => (
  <Card title="Sessões">
    <div className={styles.section}>
      <p className={styles.text}>
        Sair de todos os dispositivos encerra esta sessão agora. As outras sessões encerram em até 15 minutos.
      </p>
      <div>
        <Button className={styles.action} onClick={onSignOutAll}>
          Sair de todos os dispositivos
        </Button>
      </div>
    </div>
  </Card>
)
