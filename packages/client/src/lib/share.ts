export interface ShareData {
  title?: string
  text?: string
  url?: string
}

const isBrowser = () => typeof navigator !== 'undefined'

const isShareSupported = () => isBrowser() && typeof navigator.share === 'function'

export const share = async (data: ShareData) => {
  if (!isShareSupported()) {
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch {
    return false
  }
}
