import { useState } from 'react'
import { initials } from '../../utils/player'
import styles from './PlayerPhoto.module.css'

export type PlayerPhotoSize = 'band' | 'small'

interface PlayerPhotoProps {
  name: string
  src?: string | null
  size?: PlayerPhotoSize
}

export const PlayerPhoto = ({ name, src, size = 'band' }: PlayerPhotoProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const className = [styles.photo, styles[size]].join(' ')

  if (!src || failedSrc === src) {
    return (
      <span className={[className, styles.initials].join(' ')} role="img" aria-label={name}>
        {initials(name)}
      </span>
    )
  }

  return <img className={className} src={src} alt={name} onError={() => setFailedSrc(src)} />
}
