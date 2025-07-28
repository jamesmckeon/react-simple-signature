import {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
} from "react";

import type {
  Ref, 
  MouseEvent,
  TouchEvent 
} from "react";

import useInit from "./useInit";

export interface SignaturePadProps {
  onSignatureChange?: (blob: Blob) => void;
  height: number | null;
  width: number | null;
  className?: string;
  ref?: Ref<SignaturePadRef>; 
  blobFormat?: "png" | "jpeg";
  strokeColor?: `#${string}`;
}

export interface SignaturePadRef {
  clear: () => void;
}

export default function SignaturePad({
  ref,
  onSignatureChange,
  height,
  width,
  className, blobFormat = "png", strokeColor = "#000"
}: SignaturePadProps) {
 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tracks whether the user is currently drawing on the canvas
  const [drawing, setDrawing] = useState(false);

  // Tracks whether any drawing has occurred (used to decide if a blob should be emitted)
  const [hasDrawn, setHasDrawn] = useState(false);

  // Stores the last recorded point during drawing,
  // used to smooth the line using quadratic curves
  const [lastPoint, setLastPoint] =
  useState<{
    x: number; y: number 
  } | null>(null);

  useInit({
    height, width, strokeColor, canvasRef
  });

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




  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const position = getEventPosition(e);

    if(position === null) return; 

    const {
      offsetX, offsetY 
    } = position;
    
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setDrawing(true);
    setHasDrawn(false);
    setLastPoint({
      x: offsetX, y: offsetY 
    });
  };

  const draw = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    if (!drawing) return;

    const position = getEventPosition(e);
    if (!position || !lastPoint) return;

    const {
      offsetX, offsetY 
    } = position;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const midX = (lastPoint.x + offsetX) / 2;
    const midY = (lastPoint.y + offsetY) / 2;

    ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midX, midY);
    ctx.stroke();

    setLastPoint({
      x: offsetX, y: offsetY 
    });
    setHasDrawn(true);
  };

  const endDrawing = () => {

    if (!drawing) return; // prevent double calls

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
    e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>
  ):{
    offsetX:number, offsetY:number
  }|null => {
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
    }, `image/${blobFormat}`); 
  };

  return (

    <canvas
      aria-label="Signature pad. Draw your signature using mouse or touch."
      className={className}
      onMouseDown={startDrawing}
      onMouseLeave={endDrawing} // end drawing when user leaves canvas
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onTouchCancel={endDrawing}
      onTouchEnd={endDrawing}
      onTouchMove={draw}
      onTouchStart={startDrawing} 
      ref={canvasRef}
      role="img"
      style={{
        touchAction: "none" 
      }}
      tabIndex={0}
    />
 
  );
}
