import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { describeError, type DescribedError } from '../api/errors'
import { fieldForCode } from '../utils/accountErrors'
import type { FieldErrors } from '../utils/accountValidation'

interface FormSubmitOptions<Values extends Record<string, string>> {
  initialValues: Values
  validate: (values: Values) => FieldErrors<Extract<keyof Values, string>>
  onSubmit: (values: Values) => void
}

const codeOf = (error: unknown) =>
  error instanceof ApiError && typeof error.body === 'object' && error.body !== null
    ? (error.body as { code?: unknown }).code
    : undefined

export const useFormSubmit = <Values extends Record<string, string>>({
  initialValues,
  validate,
  onSubmit,
}: FormSubmitOptions<Values>) => {
  type Field = Extract<keyof Values, string>

  const [values, setValues] = useState(initialValues)
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FieldErrors<Field>>({})
  const [formError, setFormError] = useState<DescribedError>()

  const errors: FieldErrors<Field> = { ...serverErrors, ...(submitted ? validate(values) : {}) }

  const setField = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setServerErrors((current) => {
      const { [field]: _removed, ...rest } = current
      return rest as FieldErrors<Field>
    })
  }

  const send = () => {
    setFormError(undefined)
    onSubmit(values)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    setServerErrors({})
    if (Object.keys(validate(values)).length > 0) return
    send()
  }

  const fail = (error: unknown) => {
    const field = fieldForCode(codeOf(error))
    if (field && field in initialValues) {
      setServerErrors({ [field]: describeError(error).message } as FieldErrors<Field>)
      return
    }
    setFormError(describeError(error))
  }

  const reset = () => {
    setValues(initialValues)
    setSubmitted(false)
    setServerErrors({})
    setFormError(undefined)
  }

  return { values, errors, formError, setField, handleSubmit, retry: send, fail, reset }
}
