import type { Request, Response } from 'express'
import { SiteTheme } from '../models/SiteTheme'
import { UserTheme } from '../models/UserTheme'

export const getTheme = async (req: Request, res: Response) => {
  const { userId } = req.query

  try {
    if (!userId) {
      const themes = await SiteTheme.findAll()
      return res.json({ themes, defaultTheme: 'light' })
    }

    const userTheme = await UserTheme.findOne({
      where: { userId: Number(userId) },
      include: [SiteTheme],
    })

    if (!userTheme) {
      return res.json({ theme: 'light' })
    }

    return res.json({ theme: userTheme.theme.theme })
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching theme', error })
  }
}

export const setTheme = async (req: Request, res: Response) => {
  const { userId, theme } = req.body

  if (!userId || !theme) {
    return res.status(400).json({ message: 'userId and theme are required' })
  }

  try {
    const siteTheme = await SiteTheme.findOne({ where: { theme } })

    if (!siteTheme) {
      return res.status(404).json({ message: 'Theme not found' })
    }

    const [userTheme] = await UserTheme.findOrCreate({
      where: { userId: Number(userId) },
      defaults: { userId: Number(userId), themeId: siteTheme.id },
    })

    userTheme.themeId = siteTheme.id
    await userTheme.save()

    return res.json({ theme: siteTheme.theme })
  } catch (error) {
    return res.status(500).json({ message: 'Error setting theme', error })
  }
}
