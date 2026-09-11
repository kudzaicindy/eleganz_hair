export type ApiErrorBody = {
  error?: string
  detail?: string
}

export function getApiErrorMessage(
  status: number,
  data: ApiErrorBody,
  fallback: string,
): string {
  if (status === 504) {
    return data.detail ?? data.error ?? 'Server timed out. Check MONGODB_URI in Vercel environment variables.'
  }

  if (status === 503) {
    return data.detail ?? data.error ?? 'Database unavailable. Configure MONGODB_URI in Vercel settings.'
  }

  return data.error ?? fallback
}

export async function parseJsonResponse<T extends ApiErrorBody>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T
  } catch {
    return {} as T
  }
}
