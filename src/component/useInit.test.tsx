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

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx == null)
    throw new Error("2dContext is null")


  const strokeColor = "#123456";
  const height = 99;
  const width = 98;

  renderHook(() => { 
  
    const ref = useRef<HTMLCanvasElement>(null);
    ref.current = canvas;

    useInit({
      strokeColor,
      canvasRef: ref,
      height, width
    });

    return ref;
  
  });

  expect.soft(ctx.strokeStyle).toEqual(strokeColor);
  expect.soft(ctx.lineWidth).toEqual(2);
  expect.soft(ctx.lineCap).toEqual('round');
  expect.soft(canvas.style.width).toEqual(`${width}px`)
  expect.soft(canvas.style.height).toEqual(`${height}px`)
})

it('uses props with default pixelRatio', () =>{
    
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx == null)
    throw new Error("2dContext is null")

  const width = 98;
  const height = 99;
 
  const scaleSpy = vi.spyOn(ctx, 'scale');

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

it('uses props when pixelRatio = 2', () =>{
    
  window.devicePixelRatio = 2;
 

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx == null)
    throw new Error("2dContext is null")

  const width = 98;
  const height = 99;

  const scaleSpy = vi.spyOn(ctx, 'scale');
    
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

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx == null)
    throw new Error("2dContext is null")

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
  expect.soft(ctx.strokeStyle).toEqual("#000000");
  expect.soft(canvas.style.width).toEqual('400px');
  expect.soft(canvas.style.height).toEqual('400px')
})

it('uses default props pixelRatio = 2', () =>{

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  window.devicePixelRatio = 2;

  if (ctx == null)
    throw new Error("2dContext is null")

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
  expect.soft(ctx.strokeStyle).toEqual("#000000");
})

it("uses default height if only width is provided", () => {
  const canvas = document.createElement('canvas');

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