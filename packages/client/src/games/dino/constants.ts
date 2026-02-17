export const GAME_WIDTH = 800
export const GAME_HEIGHT = 300

export const GRAVITY = 1800
export const JUMP_VELOCITY = 860

export const SPRITE_SCALE = 3

export const DINO_SPRITE_SOURCE_X = 40
export const DINO_SPRITE_SOURCE_WIDTH = 176
export const DINO_DEAD_SPRITE_SOURCE_WIDTH = 236
export const DINO_SPRITE_FIRST_FRAME_Y = 40
export const DINO_SPRITE_FRAME_STRIDE_Y = 228
export const DINO_SPRITE_FRAME_HEIGHT = 188
export const DINO_HEIGHT = 44 * SPRITE_SCALE
export const DINO_WIDTH = Math.round(
  (DINO_SPRITE_SOURCE_WIDTH / DINO_SPRITE_FRAME_HEIGHT) * DINO_HEIGHT
)
export const DINO_RUN_FRAME_INDICES = [0, 1, 2, 3] as const
export const DINO_JUMP_FRAME_INDEX = 3
export const DINO_DEAD_FRAME_INDEX = 6
export const DINO_ANIMATION_FPS = 14
export const DINO_HITBOX_INSET_LEFT = 0.24
export const DINO_HITBOX_INSET_RIGHT = 0.16
export const DINO_HITBOX_INSET_TOP = 0.34
export const DINO_HITBOX_INSET_BOTTOM = 0.08

export const CACTUS_WIDTH = 20 * SPRITE_SCALE
export const CACTUS_HEIGHT = 40 * SPRITE_SCALE
export const CACTUS_HITBOX_INSET_LEFT = 0.2
export const CACTUS_HITBOX_INSET_RIGHT = 0.2
export const CACTUS_HITBOX_INSET_TOP = 0.06
export const CACTUS_HITBOX_INSET_BOTTOM = 0.02

export const WORLD_SPEED = 460
export const UI_TEXT_SCALE = 2
export const UI_TEXT_COLOR = '#503a2c'
