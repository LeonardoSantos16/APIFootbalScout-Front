import { useState, type FormEvent } from 'react'
import { describeError } from '../../../../api/errors'
import { Button } from '../../../../components/Button/Button'
import { TextField } from '../../../../components/TextField/TextField'
import { useCreateShortlist } from '../../hooks/useCreateShortlist'
import type { ShortlistResponse } from '../../interfaces/shortlist'
import { validateName } from '../../utils/shortlists'
import styles from './ShortlistNameForm.module.css'

const LABEL = 'Nome da shortlist'
const SUBMIT = 'Criar shortlist'
const SUBMITTING = 'Criando…'

interface ShortlistNameFormProps {
  onCreated: (shortlist: ShortlistResponse) => void
  placeholder?: string
  stacked?: boolean
}

export const ShortlistNameForm = ({ onCreated, placeholder, stacked }: ShortlistNameFormProps) => {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const create = useCreateShortlist()
  const check = validateName(name)
  const fieldError = submitted && !check.ok ? check.error : undefined
  const serverError = create.isError ? describeError(create.error).message : undefined

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!check.ok) return
    create.mutate(check.name, { onSuccess: onCreated })
  }

  return (
    <form className={[styles.form, stacked && styles.stacked].filter(Boolean).join(' ')} onSubmit={handleSubmit} noValidate>
      <TextField
        className={styles.field}
        label={LABEL}
        value={name}
        placeholder={placeholder}
        disabled={create.isPending}
        error={fieldError ?? serverError}
        onChange={(event) => {
          setName(event.target.value)
          if (create.isError) create.reset()
        }}
      />
      <Button type="submit" variant="primary" className={styles.submit} disabled={create.isPending}>
        {create.isPending ? SUBMITTING : SUBMIT}
      </Button>
    </form>
  )
}
