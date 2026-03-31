export interface Topic {
  id: number
  title: string
  description: string
  author_id: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  content: string
  author_id: string
  topic_id: number
  parentId: number | null
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

export interface ForumState {
  topics: Topic[]
  currentComments: Comment[]
  isLoading: boolean
  error: string | null
}
