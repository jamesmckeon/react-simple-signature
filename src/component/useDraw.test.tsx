import  'vitest-canvas-mock';
import useDraw from './useDraw';
import {
  renderHook , act
} from '@testing-library/react';
import {
  vi, expect, it, beforeEach 
} from 'vitest';

function createMouseEvent(x: number, y: number): 
React.MouseEvent<HTMLCanvasElement> {
  return {
    clientX: x,
    clientY: y,
    preventDefault: () => {},
    target: {
    } as EventTarget,
  }  as React.MouseEvent<HTMLCanvasElement>;
}

beforeEach(() => {
  vi.restoreAllMocks(); // resets spies/mocks
});


it('returns expected object from useDraw', () => {
  const {
    result 
  } = renderHook(() => useDraw({
  }));
  expect.soft(result.current).toHaveProperty('canvasRef');
  expect.soft(typeof result.current.draw).toBe('function');
  expect.soft(typeof result.current.startDrawing).toBe('function');
  expect.soft(typeof result.current.clear).toBe('function');

});


it('calls beginPath and moveTo on startDrawing', () => {

  const {
    canvas, context
  } = setupCanvas();

  const {
    result 
  } = renderHook(() => useDraw({
  }));

  const beginPathMock = vi.spyOn(context, 'beginPath');
  const moveToMock = vi.spyOn(context, 'moveTo');
  result.current.canvasRef.current = canvas;

  result.current.startDrawing(createMouseEvent(50, 60));

  expect.soft(beginPathMock).toHaveBeenCalled();
  expect.soft(moveToMock).toHaveBeenCalledWith(50, 60); // because left=10, top=20
});

it('calls onStart when startDrawing is triggered', () => {

  const onStart = vi.fn();

  const {
    canvas
  } = setupCanvas();

  const {
    result 
  } = renderHook(() => useDraw({
    onStart 
  }));

  result.current.canvasRef.current = canvas;

  act(() => {
    result.current.startDrawing(createMouseEvent(10, 10));
  });

  expect(onStart).toHaveBeenCalledTimes(1);
});

it('calls onChange with a Blob when drawing ends', async() => {

  const {
    canvas
  } = setupCanvas();

  const onChange = vi.fn();

  const {
    result 
  } = renderHook(() => useDraw({
    onChange, blobFormat: 'png' 
  }));

  result.current.canvasRef.current = canvas;

  // have to wrap each method in act() bc test needs state to update
  // between them
  act(() => {
    result.current.startDrawing(createMouseEvent(10, 10));
  });

  act(() => {
    result.current.endDrawing();
  });

  // canvas.toBlob() is callback/async, so we have to
  // waitFor() here
  await vi.waitFor(() => { 
    // expect.soft inside waitFor() won't work
    expect(onChange).toHaveBeenCalledTimes(1); 

    const blob = onChange.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

});

it('doesnt call onChange if nothing has been drawn', () => {
  const {
    canvas
  } = setupCanvas();
  
  const onChange = vi.fn();
  const {
    result 
  } = renderHook(() => useDraw({
    onChange, blobFormat: 'png' 
  }));
  
  result.current.canvasRef.current = canvas;

  act(() => {
    result.current.endDrawing();
  });

  expect(onChange).not.toHaveBeenCalled();
});

it('clears canvas on clear()', () =>{

  const {
    canvas, context
  } = setupCanvas();

  const {
    result 
  } = renderHook(() => useDraw({
  }));

  result.current.canvasRef.current =canvas;

  result.current.startDrawing(createMouseEvent(1,2));
  result.current.draw(createMouseEvent(10, 11));
  result.current.clear();

  // useInit() will modify the canvas size if specified by user
  // since useInit() isn't used here, the canvas will be using its
  // intrinsic width and height: 300x150
  expect(context.clearRect).toHaveBeenCalledWith(0, 0, 300, 150);
  
})

it('aborts draw() if startDrawing() hasnt been called first', () =>{

  const {
    canvas, context
  } = setupCanvas();

  const{
    result
  } = renderHook(() => useDraw({
  }))

  result.current.canvasRef.current = canvas;

  result.current.draw(createMouseEvent(1,1));

  expect(context.quadraticCurveTo).toHaveBeenCalledTimes(0);

})

it('calls expected on draw()',async () =>{

  const {
    canvas, context
  } = setupCanvas();

  const{
    result
  } = renderHook(() => useDraw({
  }))

  result.current.canvasRef.current = canvas;

  await vi.waitFor(() =>{
    result.current.startDrawing(createMouseEvent(1,1));
    result.current.draw(createMouseEvent(1,1));

    expect(context.quadraticCurveTo).toHaveBeenCalledTimes(1);
  })
  

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