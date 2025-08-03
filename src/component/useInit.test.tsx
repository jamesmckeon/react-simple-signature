import {
  it, expect, beforeAll, afterAll, afterEach, vi 
} from 'vitest';
import {
  render, cleanup, waitFor, screen 
} from '@testing-library/react';
import {
  useRef
} from 'react';
import useInit from './useInit';

// Test component with proper typing
function TestComponent({
  width,
  height,
  strokeColor,
  testId = 'canvas', // Allow unique test IDs
}: {
  width?: number;
  height?: number;
  strokeColor: `#${string}`;
  testId?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  

  useInit({
    width, height, strokeColor, canvasRef  
  });

  return <canvas data-testid={testId}
    ref={canvasRef} />;
}


let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
let originalDevicePixelRatio: number;

// Mock canvas context
const mockContext = {
  stroke: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  clearRect: vi.fn(),
  scale: vi.fn(),
  strokeStyle: '#000000',
  lineWidth: 1,
  lineCap: 'round',
  lineJoin: 'round',
};

beforeAll(() => {
  originalGetContext = HTMLCanvasElement.prototype.getContext;
  originalDevicePixelRatio = window.devicePixelRatio;

  // Mock getContext with proper typing
  HTMLCanvasElement.prototype.getContext = vi.fn((
    contextId: string
  ): CanvasRenderingContext2D | null => {
    if (contextId === '2d') {
      return mockContext as unknown as CanvasRenderingContext2D;
    }
    return null;
  });
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  Object.defineProperty(window, 'devicePixelRatio', {
    value: originalDevicePixelRatio,
    writable: true,
    configurable: true
  });
});

afterEach(() => {
  cleanup(); // Clean up between tests
  vi.clearAllMocks();
});

it('should initialize canvas with default dimensions', () => {
  const {
    getByTestId 
  } = render(
    <TestComponent strokeColor="#000"
      testId="canvas-1" />
  );
    
  const canvas = getByTestId('canvas-1') as HTMLCanvasElement;
  expect(canvas).toBeTruthy();
  expect(canvas.tagName).toBe('CANVAS');
});

it('should initialize canvas with custom dimensions', () => {
  const {
    getByTestId 
  } = render(
    <TestComponent 
      height={200} 
      strokeColor="#ff0000" 
      testId="canvas-2" 
      width={300} 
    />
  );
    
  const canvas = getByTestId('canvas-2') as HTMLCanvasElement;
  expect(canvas.style.width).toBe('300px');
  expect(canvas.style.height).toBe('200px');
});

it('should handle high DPI screens', () => {
  // Mock devicePixelRatio
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 2,
    writable: true,
    configurable: true
  });

  const {
    getByTestId 
  } = render(
    <TestComponent 
      height={100} 
      strokeColor="#000" 
      testId="canvas-3" 
      width={100} 
    />
  );
    
  const canvas = getByTestId('canvas-3') as HTMLCanvasElement;
  expect(canvas.width).toBe(200); // 100 * 2 (dpr)
  expect(canvas.height).toBe(200); // 100 * 2 (dpr)
});

it('should apply stroke color to context', () => {
  const {
    getByTestId 
  } = render(
    <TestComponent 
      strokeColor="#ff0000" 
      testId="canvas-4" 
    />
  );
    
  const canvas = getByTestId('canvas-4') as HTMLCanvasElement;
  expect(canvas).toBeTruthy();
  expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
});

it('sets canvas width and height based on DPR and props', async () => {
  render(
    <TestComponent height={200}
      strokeColor="#ff0000"
      width={300} />
  ); 
  await waitFor(() => {
    const canvas = screen.getByTestId('canvas');
    expect(canvas.width).toBe(600);
  });
});

it('sets canvas style dimensions to logical pixel size', async () => {
  render(
    <TestComponent height={200}
      strokeColor="#00ff00"
      width={300} />
  );
  await waitFor(() => {
    const canvas = screen.getByTestId('canvas');
    expect(canvas.style.width).toBe('300px');
  });
});

it('applies correct strokeStyle to context', async () => {
  render(
    <TestComponent height={100}
      strokeColor="#123456"
      width={100} />
  );
  await waitFor(() => {
    const canvas = screen.getByTestId('canvas') ;
    const ctx = canvas.getContext('2d');
    expect(ctx.strokeStyle).toBe('#123456');
  });
});

it('scales context using device pixel ratio', async () => {
  const scaleSpy = vi.spyOn(mockContext, 'scale');
  render(<TestComponent height={100}
    strokeColor="#000000"
    width={100} />);
  await waitFor(() => {
    expect(scaleSpy).toHaveBeenCalledWith(2, 2);
  });
  scaleSpy.mockRestore();
});

it('sets default lineWidth and lineCap', async () => {
  const {
    getByTestId 
  } = render(
    <TestComponent height={100}
      strokeColor="#000"
      width={100} />
  );
  await waitFor(() => {
    const canvas = getByTestId('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    expect(ctx?.lineWidth).toBe(2);
  });
});

it('uses fallback width and height if null', async () => {
  const {
    getByTestId 
  } = render(
    <TestComponent
      strokeColor="#abcdef"
    />
  );
  await waitFor(() => {
    const canvas = getByTestId('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(800); // 400 * 2
  });
});
