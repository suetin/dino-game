export type InputState = {
  jumpRequested: boolean
}

export const createInputState = (): InputState => ({
  jumpRequested: false,
})

export const bindKeyboard = (input: InputState) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      input.jumpRequested = true
    }
  }

  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
