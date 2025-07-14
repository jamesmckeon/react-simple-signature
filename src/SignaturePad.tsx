import {
  useRef,
  useEffect,
  useState,
  useImperativeHandle
} from "react";

export interface SignaturePadProps {
  onSignatureChange?: (blob: Blob) => void;
  height: number | null;
  width: number | null;
  className?: string;
  ref?: React.Ref<SignaturePadRef>; 
}

export interface SignaturePadRef {
  clear: () => void;
}

export default function SignaturePad({
  ref,
  onSignatureChange,
  height,
  width,
  className
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [lastPoint, setLastPoint] =
    useState<{ x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = width ?? 400;
    const canvasHeight = height ?? 400;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.scale(dpr, dpr);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
  }, [width, height]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const { offsetX, offsetY } = getEventPosition(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setDrawing(true);
    setHasDrawn(false);
    setLastPoint({ x: offsetX, y: offsetY });
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!drawing) return;

    const position = getEventPosition(e);
    if (!position || !lastPoint) return;

    const { offsetX, offsetY } = position;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const midX = (lastPoint.x + offsetX) / 2;
    const midY = (lastPoint.y + offsetY) / 2;

    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.stroke();

    setLastPoint({ x: offsetX, y: offsetY });
    setHasDrawn(true);
  };

  const endDrawing = () => {
    setDrawing(false);
    setLastPoint(null);

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.closePath();

    if (hasDrawn) {
      emitBlob();
    }
  };

  const getEventPosition = (
    e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rectangle = canvas.getBoundingClientRect();

    return {
      offsetX: clientX - rectangle.left,
      offsetY: clientY - rectangle.top,
    };
  };

  const emitBlob = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (onSignatureChange && blob) {
        onSignatureChange(blob);
      }
    }, "image/png");
  };

  return (
    <div className="component">
      <canvas
        className={className}
        onMouseDown={startDrawing}
        onMouseLeave={endDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
        onTouchStart={startDrawing}
        ref={canvasRef}
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
