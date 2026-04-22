export type InputState = {
  jumpRequested: boolean
}

export const createInputState = (): InputState => ({
  jumpRequested: false,
})
