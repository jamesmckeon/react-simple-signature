import useDraw from './useDraw';
import {
  renderHook , act
} from '@testing-library/react';
import {
  vi, expect, it, beforeEach , type MockInstance
} from 'vitest';

type CanvasContext = {
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => void;
  stroke: () => void;
  closePath: () => void;
  clearRect: (x: number, y: number, w: number, h: number) => void;
};

type CanvasMock = {
  getContext: (type?: string) => CanvasContext;
  getBoundingClientRect: () => {
    left: number; top: number 
  };
  toBlob: (cb: (blob: Blob) => void, type?: string) => void;
  width?: number;
  height?: number;
};

function createCanvasMock(): CanvasMock & {
  _context: CanvasContext 
} {
  const context: CanvasContext = {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    closePath: vi.fn(),
    clearRect: vi.fn(),
  };

  return {
    getContext: vi.fn(() => context),
    getBoundingClientRect: vi.fn(() => ({
      left: 10,
      top: 20,
    })),
    toBlob: vi.fn((cb: (blob: Blob) => void, type?: string) => {
      cb(new Blob(['test'], {
        type: type as string 
      }));
    }),
    _context: context,
  };
}

function createMouseEvent(x: number, y: number): 
React.MouseEvent<HTMLCanvasElement> {
  return {
    clientX: x,
    clientY: y,
    preventDefault: () => {},
    target: {
    } as EventTarget,
  } as unknown as React.MouseEvent<HTMLCanvasElement>;
}

let canvasMock: CanvasMock & {
  _context: CanvasContext 
};

beforeEach(() => {
  canvasMock = createCanvasMock();
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
    result 
  } = renderHook(() => useDraw({
  }));
  // as unknown to avoid having to define every canvas property
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  result.current.startDrawing(createMouseEvent(50, 60));

  const context = (canvasMock)._context;
  expect.soft(context.beginPath).toHaveBeenCalled();
  expect.soft(context.moveTo).toHaveBeenCalledWith(40, 40); // because left=10, top=20
});

it('calls closePath and toBlob on endDrawing if hasDrawn', () => {
  const onChange = vi.fn();
  const {
    result 
  } = renderHook(() => useDraw({
    onChange, blobFormat: 'png' 
  }));
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  act(() => {
    result.current.startDrawing(createMouseEvent(10, 10));
  });

  act(() => {
    result.current.setHasDrawn(true); 
  });

  act(() => {
    result.current.endDrawing();
  });

  const context = (canvasMock)._context;
  expect.soft(context.closePath).toHaveBeenCalled();
  expect.soft(canvasMock.toBlob).toHaveBeenCalled();
  expect.soft(onChange).toHaveBeenCalledWith(expect.any(Blob));
});


it('calls onStart when startDrawing is triggered', () => {
  const onStart = vi.fn();
  const {
    result 
  } = renderHook(() => useDraw({
    onStart 
  }));
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  act(() => {
    result.current.startDrawing(createMouseEvent(10, 10));
  });

  expect(onStart).toHaveBeenCalledTimes(1);
});

it('calls onChange with a Blob when drawing ends', () => {
  const onChange = vi.fn();
  const {
    result 
  } = renderHook(() => useDraw({
    onChange, blobFormat: 'png' 
  }));
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  // have to wrap each method in act() bc test needs state to update
  // between them
  act(() => {
    result.current.startDrawing(createMouseEvent(10, 10));
  });

  act(() => {
    result.current.setHasDrawn(true);
  });

  act(() => {
    result.current.endDrawing();
  });

  expect.soft(onChange).toHaveBeenCalledTimes(1);
  expect.soft(onChange.mock.calls[0][0]).toBeInstanceOf(Blob);
});

it('does not draw if drawing is false', () => {
  const {
    result 
  } = renderHook(() => useDraw({
  }));
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  act(() => {
    result.current.draw(createMouseEvent(20, 30));
  });

  const context = canvasMock._context;
  expect.soft(context.quadraticCurveTo).not.toHaveBeenCalled();
  expect.soft(context.stroke).not.toHaveBeenCalled();
});

it('does not emit blob or closePath if drawing is false', () => {
  const onChange = vi.fn();
  const {
    result 
  } = renderHook(() => useDraw({
    onChange, blobFormat: 'png' 
  }));
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  act(() => {
    result.current.endDrawing();
  });

  const context = canvasMock._context;
  expect.soft(context.closePath).not.toHaveBeenCalled();
  expect.soft(canvasMock.toBlob).not.toHaveBeenCalled();
  expect.soft(onChange).not.toHaveBeenCalled();
});

it('clears canvas and resets state on clear()', () =>{
  const {
    result 
  } = renderHook(() => useDraw({
  }));

  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  // these will be used later to confirm
  // spy has been called as expected
  const width = 99;
  const height = 98;

  result.current.canvasRef.current.width = width;
  result.current.canvasRef.current.height = height;

  (canvasMock.getContext as unknown as MockInstance)
    .mockReturnValue(canvasMock._context);

  act(() => {
    result.current.clear();
  });

  expect(canvasMock._context.clearRect).
    toHaveBeenCalledWith(0, 0, canvasMock.width, canvasMock.height);
  
})

it('draw calls expected methods', () => {
  // Arrange
  const {
    result 
  } = renderHook(() => useDraw({
  }));
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  act(() => {
    result.current.startDrawing(createMouseEvent(10, 10));
  });

  act(() => {
    result.current.draw(createMouseEvent(20, 20));
  });

  // Assert
  const ctx = canvasMock._context;

  expect(ctx.quadraticCurveTo).toHaveBeenCalled();
  expect(ctx.stroke).toHaveBeenCalled();
  
});

it('does not draw if lastPoint is null', () => {
  const {
    result 
  } = renderHook(() => useDraw({
  }));
  result.current.canvasRef.current = canvasMock as unknown as HTMLCanvasElement;

  act(() => {
    result.current.draw(createMouseEvent(10, 10)); // no startDrawing()
  });

  expect(canvasMock._context.quadraticCurveTo).not.toHaveBeenCalled();
  expect(canvasMock._context.stroke).not.toHaveBeenCalled();
});