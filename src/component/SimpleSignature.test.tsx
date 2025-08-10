
import {
  it, expect, vi, afterEach,
  beforeEach 
} from 'vitest'
import {
  render, screen, fireEvent, cleanup
} from '@testing-library/react'
import  'vitest-canvas-mock';
import Sut from './SimpleSignature';

let canvasRef: {
  current: HTMLCanvasElement 
};

const startDrawing = vi.fn();
const endDrawing = vi.fn();
const draw = vi.fn();

beforeEach(() =>{
  const {
    canvas 
  } = setupCanvas();

  canvasRef = {
    current: canvas 
  };

  vi.mock('./useDraw', () => ({
    __esModule: true,
    default: vi.fn(() => ({
      draw,
      startDrawing,
      endDrawing,
      clear: vi.fn(),
      canvasRef
    })),
  }));

})

afterEach(() => {
  cleanup();
});

it('is accessible', () =>{
  render(<Sut/>);
  expect(screen.getByRole('img'))
    .toHaveAccessibleName(/signature input area/i)
})

it('sets style', () =>{
  render(<Sut/>);
  screen.debug();
  const el = 
    screen.getByRole('img');

  expect(el.style.touchAction).toBe('none');
})

it('calls startDrawing', () =>{

  render(<Sut/>);
    
  const element = screen.getByRole('img');

  fireEvent.mouseDown(element);
  fireEvent.touchStart(element);

  expect(startDrawing).toHaveBeenCalledTimes(2);
})

it('calls endDrawing', () =>{

  render(<Sut/>);
    
  const element = screen.getByRole('img');

  fireEvent.mouseLeave(element);
  fireEvent.mouseUp(element);
  fireEvent.touchCancel(element);
  fireEvent.touchEnd(element);

  expect(endDrawing).toHaveBeenCalledTimes(4);
})

it('calls draw', () =>{

  render(<Sut/>);
    
  const element = screen.getByRole('img');

  fireEvent.touchMove(element);
  fireEvent.mouseMove(element);

  expect(draw).toHaveBeenCalledTimes(2);
})

function setupCanvas() {
  const canvas = document.createElement('canvas');

  const context = canvas.getContext('2d');

  if (context == null)
    throw new Error("2dContext is null");

  // Always return this same instance when getContext is called
  vi.spyOn(canvas, 'getContext').mockReturnValue(context);
  
  return {
    canvas, context
  };
}