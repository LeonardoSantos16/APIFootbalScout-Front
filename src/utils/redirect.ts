export const HOME_PATH = '/'

export const safeRedirect = (value: unknown): string => {
  if (typeof value !== 'string') return HOME_PATH
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return HOME_PATH
  return value
}
