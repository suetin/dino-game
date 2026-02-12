import { useEffect } from 'react'
import { useDispatch, useSelector, useStore } from '@/store'
import {
  setPageHasBeenInitializedOnServer,
  selectPageHasBeenInitializedOnServer,
} from '@/slices/ssrSlice'
import { PageInitArgs, PageInitContext } from '@/routes'

const getCookie: (name: string) => string | undefined = (name: string): string | undefined => {
  const matches: RegExpMatchArray | null = document.cookie.match(
    new RegExp(
      '(?:^|; )' +
        // eslint-disable-next-line
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
        '=([^;]*)'
    )
  )
  return matches ? decodeURIComponent(matches[1]) : undefined
}

const createContext: () => PageInitContext = (): PageInitContext => ({
  clientToken: getCookie('token'),
})

type PageProps = {
  initPage: (data: PageInitArgs) => Promise<unknown>
}

export const usePage: (props: PageProps) => void = ({ initPage }: PageProps) => {
  const dispatch: ReturnType<typeof useDispatch> = useDispatch()
  const pageHasBeenInitializedOnServer: boolean = useSelector(selectPageHasBeenInitializedOnServer)
  const store = useStore()

  useEffect((): void => {
    if (pageHasBeenInitializedOnServer) {
      dispatch(setPageHasBeenInitializedOnServer(false))
      return
    }
    initPage({ dispatch, state: store.getState(), ctx: createContext() })
  }, [])
}
