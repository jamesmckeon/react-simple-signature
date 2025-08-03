import {
  it, beforeEach, expect, vi , afterEach
} from 'vitest';
import {
  render, screen, cleanup
} from '@testing-library/react'
import {
  useRef 
} from 'react';
import useInit from './useInit';

function createMock2DContext() {
  let _lineWidth = 0;
  let _lineCap: CanvasLineCap = 'butt';
  let _strokeStyle: string | CanvasGradient | CanvasPattern = '';
  return {
    scale: vi.fn(),
    get lineWidth() {
      return _lineWidth;
    },
    set lineWidth(value: number) {
      _lineWidth = value;
    },
    get lineCap() {
      return _lineCap;
    },
    set lineCap(value: CanvasLineCap) {
      _lineCap = value;
    },
    get strokeStyle() {
      return _strokeStyle;
    },
    set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
      _strokeStyle = value;
    },
  } as unknown as CanvasRenderingContext2D;
}

function TestComponent({
  width, height, strokeColor 
}: {
  width?: number;
  height?: number;
  strokeColor: `#${string}`;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useInit({
    width, height, strokeColor, canvasRef 
  });

  return <canvas data-testid="canvas"
    ref={canvasRef} />;
}

let originalGetContext: (this: HTMLCanvasElement, 
  contextId: string, ...args: unknown[]) => 
    RenderingContext | null;

let mockCtx: CanvasRenderingContext2D;

beforeEach(() => {
  mockCtx = createMock2DContext();

  // Save the original getContext
  originalGetContext = HTMLCanvasElement.prototype
    .getContext.bind(HTMLCanvasElement.prototype);

  // Mock getContext to return our mock context for "2d", null otherwise
  HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
    if (contextId === "2d") {
      return mockCtx;
    }
    return null;
  }) as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  // Restore original after test
  HTMLCanvasElement.prototype.getContext = 
    originalGetContext as typeof HTMLCanvasElement.prototype.getContext;

  cleanup();
});

it('initializes canvas with defaults ', () => {
  render(<TestComponent strokeColor="#123456" />);
  const canvas = screen.getByTestId('canvas');

  const dpr = window.devicePixelRatio || 1;

  expect.soft((canvas as HTMLCanvasElement).width).toBe(400 * dpr);
  expect.soft((canvas as HTMLCanvasElement).height).toBe(400 * dpr);
  expect.soft(canvas.style.width).toBe('400px');
  expect.soft(canvas.style.height).toBe('400px');

  // Verify drawing styles were applied
  expect.soft(mockCtx.lineWidth).toEqual(2);
  expect.soft((mockCtx ).lineCap).toBe('round');
  expect.soft((mockCtx).strokeStyle).toBe('#123456');
})

it('applies provided dimensions correctly', () => {
  render(
    <TestComponent height={300}
      strokeColor="#abcdef"
      width={600} />
  );
  const canvas = screen.getByTestId('canvas');
  const ctx = (canvas as HTMLCanvasElement)
    .getContext('2d') as CanvasRenderingContext2D;
  const dpr = window.devicePixelRatio || 1;

  expect((canvas as HTMLCanvasElement).width).toBe(600 * dpr);
  expect((canvas as HTMLCanvasElement).height).toBe(300 * dpr);
  expect(canvas.style.width).toBe('600px');
  expect(canvas.style.height).toBe('300px');

  expect((ctx).strokeStyle).toBe('#abcdef');
});

it('does nothing if canvasRef.current is null', () => {
  const getContextSpy = vi.fn();

  // Override getContext to verify it’s not called
  HTMLCanvasElement.prototype.getContext = getContextSpy;

  function NullRefComponent() {
    const canvasRef = {
      current: null 
    };
   
    useInit({
      width: 100, height: 100, strokeColor: '#000000', canvasRef 
    });
    return null; 
  }

  render(<NullRefComponent />);
  expect(getContextSpy).not.toHaveBeenCalled();
});
