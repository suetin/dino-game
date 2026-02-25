import { DinoGameAssets } from './DinoGameAssets'

type FakeImageRecord = {
  image: HTMLImageElement
  triggerLoad: () => void
  triggerError: () => void
}

function createImageFactory() {
  const records: FakeImageRecord[] = []

  const factory = (): HTMLImageElement => {
    let onload: (() => void) | null = null
    let onerror: (() => void) | null = null

    const image = {
      width: 10,
      height: 10,
      set onload(handler: (() => void) | null) {
        onload = handler
      },
      get onload() {
        return onload
      },
      set onerror(handler: (() => void) | null) {
        onerror = handler
      },
      get onerror() {
        return onerror
      },
      set src(_value: string) {
        // no-op; test drives completion manually
      },
      get src() {
        return ''
      },
    } as unknown as HTMLImageElement

    records.push({
      image,
      triggerLoad: () => {
        onload?.()
      },
      triggerError: () => {
        onerror?.()
      },
    })

    return image
  }

  return { factory, records }
}

describe('DinoGameAssets', () => {
  it('load возвращает один Promise при повторных вызовах', () => {
    const { factory } = createImageFactory()
    const assets = new DinoGameAssets(factory)

    const first = assets.load()
    const second = assets.load()

    expect(first).toBe(second)
    expect(assets.status).toBe('loading')
  })

  it('переходит в ready после загрузки всех ассетов', async () => {
    const { factory, records } = createImageFactory()
    const onAssetLoaded = jest.fn()
    const assets = new DinoGameAssets(factory, { onAssetLoaded })

    const loadPromise = assets.load()

    expect(assets.status).toBe('loading')
    expect(assets.isReady()).toBe(false)

    for (const record of records) {
      record.triggerLoad()
    }

    await expect(loadPromise).resolves.toBeUndefined()
    expect(assets.status).toBe('ready')
    expect(assets.isReady()).toBe(true)
    expect(assets.hasError()).toBe(false)
    expect(onAssetLoaded).toHaveBeenCalled()
  })

  it('остается в loading, пока не загрузится земля', async () => {
    const { factory, records } = createImageFactory()
    const assets = new DinoGameAssets(factory)
    const loadPromise = assets.load()

    expect(records.length).toBeGreaterThan(1)

    for (let i = 1; i < records.length; i++) {
      records[i].triggerLoad()
    }

    expect(assets.status).toBe('loading')
    expect(assets.isReady()).toBe(false)

    records[0].triggerLoad()
    await expect(loadPromise).resolves.toBeUndefined()
    expect(assets.status).toBe('ready')
  })

  it('переходит в error при ошибке загрузки', async () => {
    const { factory, records } = createImageFactory()
    const onAssetError = jest.fn()
    const assets = new DinoGameAssets(factory, { onAssetError })

    const loadPromise = assets.load()
    records[0].triggerError()

    await expect(loadPromise).rejects.toThrow('Failed to load asset')
    expect(assets.status).toBe('error')
    expect(assets.hasError()).toBe(true)
    expect(onAssetError).toHaveBeenCalled()
  })
})
