/** Browser download helpers. Nothing is uploaded: files are built and saved locally. */

export function downloadUrl(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
}

export function downloadText(text: string, filename: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }))
  downloadUrl(url, filename)
  // Give the browser a moment to start the download before freeing the URL.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** "2026-10-21", for file names. */
export function dateStamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
