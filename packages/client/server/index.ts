import dotenv from 'dotenv'

if (process.env.LOAD_DOTENV_FILE !== '0') {
  dotenv.config()
}

import express from 'express'
import path from 'path'

import fs from 'fs/promises'
import type { HelmetData } from 'react-helmet'
import serialize from 'serialize-javascript'
import { createServer as createViteServer } from 'vite'
import type { ViteDevServer } from 'vite'
import cookieParser from 'cookie-parser'

const port = process.env.PORT || 3000
const clientPath = process.cwd()
const isDev = process.env.NODE_ENV === 'development'

type RenderResult =
  | {
      response: Response
    }
  | {
      helmet: HelmetData
      html: string
      initialState: unknown
    }

type RenderFn = (req: express.Request) => Promise<RenderResult>

async function loadRenderer(vite: ViteDevServer | undefined, url: string) {
  let template: string
  let render: RenderFn

  if (vite) {
    template = await fs.readFile(path.resolve(clientPath, 'index.html'), 'utf-8')
    template = await vite.transformIndexHtml(url, template)
    render = (await vite.ssrLoadModule(path.join(clientPath, 'src/entry-server.tsx'))).render
  } else {
    template = await fs.readFile(path.join(clientPath, 'dist/client/index.html'), 'utf-8')
    const pathToServer = path.join(clientPath, 'dist/server/entry-server.js')
    render = (await import(pathToServer)).render
  }

  return { render, template }
}

function sendRouterResponse(res: express.Response, response: Response) {
  response.headers.forEach((value, key) => {
    res.append(key, value)
  })

  return response.text().then(body => res.status(response.status).send(body))
}

function injectHtml(template: string, rendered: Exclude<RenderResult, { response: Response }>) {
  return template
    .replace(
      '<!--ssr-helmet-->',
      `${rendered.helmet.meta.toString()} ${rendered.helmet.title.toString()} ${rendered.helmet.link.toString()}`
    )
    .replace('<!--ssr-outlet-->', rendered.html)
    .replace(
      '<!--ssr-initial-state-->',
      `<script>window.APP_INITIAL_STATE = ${serialize(rendered.initialState, {
        isJSON: true,
      })}</script>`
    )
}

async function createServer() {
  const app = express()

  app.use(cookieParser())
  let vite: ViteDevServer | undefined
  if (isDev) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      root: clientPath,
      appType: 'custom',
    })

    app.use(vite.middlewares)
  } else {
    app.use(express.static(path.join(clientPath, 'dist/client'), { index: false }))
  }

  app.get('*', async (req, res, next) => {
    const url = req.originalUrl

    try {
      const { render, template } = await loadRenderer(vite, url)
      const rendered = await render(req)

      if ('response' in rendered) {
        await sendRouterResponse(res, rendered.response)
        return
      }

      const html = injectHtml(template, rendered)
      res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e as Error)
      }
      next(e)
    }
  })

  app.listen(port, () => {
    console.log(`Client is listening on port: ${port}`)
  })
}

createServer()
