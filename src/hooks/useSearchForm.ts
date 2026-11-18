import { useState } from 'react'
import { normalizeTerm, validateTerm } from '../utils/search'

interface SearchFormOptions {
  initialValue?: string
  onSearch: (term: string) => void
}

export const useSearchForm = ({ initialValue = '', onSearch }: SearchFormOptions) => {
  const [value, setValue] = useState(initialValue)
  const [submitted, setSubmitted] = useState(false)
  const error = submitted ? validateTerm(value) : undefined

  const submit = () => {
    setSubmitted(true)
    const term = normalizeTerm(value)
    if (validateTerm(value) === undefined && term) onSearch(term)
  }

  return { value, onChange: setValue, onSubmit: submit, error }
}
