import {
  it, expect, vi, beforeAll 
} from 'vitest'
import {
  render, fireEvent, screen, waitFor 
} from '@testing-library/react'
import {
  useRef, type ComponentPropsWithoutRef 
} from 'react'
import SignaturePad, {
  type SignaturePadRef
} from './SignaturePad'

// Stub for HTMLCanvasElement.toBlob (since it's async and may not be implemented in JSDOM)
beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback: (blob: Blob) => void) {
      const blob = new Blob(['fake image'], {
        type: 'image/png' 
      })
      callback(blob)
    },
    configurable: true
  })
})

// Wrapper component to expose ref for imperative clear test
function SignaturePadWithRef(props: 
ComponentPropsWithoutRef<typeof SignaturePad>) {
  const padRef = useRef<SignaturePadRef>(null)

  return (
    <>
      <button data-testid="clear-button"
        onClick={() => padRef.current?.clear()}
        type='button'>Clear</button>
      <SignaturePad ref={padRef}
        {...props} />
    </>
  )
}

it('renders a canvas element', () => {
  render(<SignaturePad height={150}
    width={300} />)
  screen.debug()
  const canvas = screen.getByRole('presentation');
  expect(canvas).toBeTruthy()
  expect(canvas.tagName).toBe('CANVAS')
})

it('calls onSignatureChange after drawing', async () => {
  const onSignatureChange = vi.fn()
  render(<SignaturePad height={100} 
    onChange={onSignatureChange}
    width={100} />)

  const canvas = screen.getByRole('presentation') ;
 
  const {
    left, top 
  } = canvas.getBoundingClientRect()

  fireEvent.mouseDown(canvas, {
    clientX: left + 10, clientY: top + 10 
  })
  fireEvent.mouseMove(canvas, {
    clientX: left + 30, clientY: top + 30 
  })
  fireEvent.mouseUp(canvas)

  await waitFor(() => {
    expect(onSignatureChange).toHaveBeenCalled()
  })
})

it('clears the canvas when calling ref.clear()', () => {
  const {
    getByTestId 
  } = render(
    <SignaturePadWithRef height={100}
      width={100} />
  )
  const canvas = document.querySelector('canvas') as HTMLCanvasElement
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas context not found')
  }

  const clearSpy = vi.spyOn(context, 'clearRect')

  fireEvent.click(getByTestId('clear-button'))

  expect(clearSpy).toHaveBeenCalled()
})
