import  'vitest-canvas-mock';

import {
  useRef
} from 'react'
import {
  it, expect , beforeEach, vi, afterEach
} from 'vitest';

import {
  renderHook 
} from '@testing-library/react';
import useInit from './useInit';

let originalDevicePixelRatio: number;

beforeEach(() => {
  vi.restoreAllMocks(); // resets spies/mocks
  originalDevicePixelRatio = window.devicePixelRatio; // save current DPR
});

afterEach(() => {
  window.devicePixelRatio = originalDevicePixelRatio; // restore DPR
});

it('uses non-dpr dependent props', () =>{
  // doesn't make sense to test these when the devicePixelRatio changes

  const {
    canvas, context
  } = setupCanvas();
  
  const strokeColor = "#123456";
  const height = 99;
  const width = 98;
  const className = 'test-class';

  renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      strokeColor,
      canvasRef: ref,
      height, 
      width,
      className
    });

    return ref;
  
  });

  expect.soft(context.strokeStyle).toEqual(strokeColor);
  expect.soft(context.lineWidth).toEqual(2);
  expect.soft(context.lineCap).toEqual('round');
  expect.soft(canvas.style.width).toEqual(`${width}px`)
  expect.soft(canvas.style.height).toEqual(`${height}px`)
  expect.soft(canvas.className).toEqual(className);
})

it('uses dimension props with default pixelRatio', () =>{
    
  const {
    canvas, context
  } = setupCanvas();
 
  const width = 98;
  const height = 99;
 
  const scaleSpy = vi.spyOn(context, 'scale');

  renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      height,
      width,
      canvasRef: ref
    });

    return ref;
  
  });

  expect.soft(canvas.width).toEqual(width);
  expect.soft(canvas.height).toEqual(height);
  expect.soft(scaleSpy).toHaveBeenCalledWith(1, 1);
})

it('uses dimension props when pixelRatio = 2', () =>{
    
  window.devicePixelRatio = 2;
 
  const {
    canvas, context
  } = setupCanvas();


  const width = 98;
  const height = 99;

  const scaleSpy = vi.spyOn(context, 'scale');
    
  renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      height,
      width,
      canvasRef: ref
    });

    return ref;
  
  });

  expect.soft(canvas.width).toEqual(width * window.devicePixelRatio);
  expect.soft(canvas.height).toEqual(height* window.devicePixelRatio);
  expect.soft(scaleSpy).toHaveBeenCalledWith(2, 2);
})

it('uses default props', () =>{

  const {
    canvas, context
  } = setupCanvas();

  renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      canvasRef: ref
    });

    return ref;
  
  });

  expect.soft(canvas.width).toEqual(400);
  expect.soft(canvas.height).toEqual(400);
  expect.soft(context.strokeStyle).toEqual("#000000");
  expect.soft(canvas.style.width).toEqual('400px');
  expect.soft(canvas.style.height).toEqual('400px')
  expect.soft(canvas.className).toBeFalsy();
  expect.soft(canvas.tabIndex).toEqual(0);
  expect.soft(canvas.role).toEqual('img');
})

it('uses default dimensions when pixelRatio = 2', () =>{

  const {
    canvas
  } = setupCanvas();
  window.devicePixelRatio = 2;

  renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      canvasRef: ref
    });

    return ref;
  
  });

  expect.soft(canvas.width).toEqual(400*window.devicePixelRatio);
  expect.soft(canvas.height).toEqual(400*window.devicePixelRatio);
})

it("uses default height if only width is provided", () => {
  const {
    canvas
  } = setupCanvas();

  renderHook(() => {
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      width: 250,
      canvasRef: ref
    });

    return ref;
  });

  expect(canvas.width).toBe(250);
  expect(canvas.height).toBe(400); // default
});

it('doesnt throw when canvas is null', () =>{

  // const {
  //   canvas
  // } = setupCanvas();

  expect(() => renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);

    useInit({
      canvasRef: ref
    });

  })).not.toThrow();

})

it ('doesnt throw when context is null', () =>{
  
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(null);

  const canvas = document.createElement('canvas');

  expect(() => renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      canvasRef: ref
    });

  })).not.toThrow();
})

function setupCanvas() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context == null)
    throw new Error("2dContext is null");

  return {
    canvas, context
  };
}
