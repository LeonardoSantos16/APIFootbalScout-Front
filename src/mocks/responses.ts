import { HttpResponse } from 'msw'

export const problem = (status: number, code?: string, instance = 'GET /api') =>
  HttpResponse.json(
    {
      type: 'https://tools.ietf.org/html/rfc9110',
      title: status === 502 ? 'External data source unavailable' : 'Internal Server Error',
      status,
      detail: 'Detalhe de diagnostico que nao vai para a tela.',
      instance,
      ...(code ? { code } : {}),
    },
    { status, headers: { 'content-type': 'application/problem+json' } },
  )

export const plainText = (status: number, text: string) =>
  new HttpResponse(text, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } })
