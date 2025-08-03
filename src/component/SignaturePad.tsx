import {
  useImperativeHandle,
} from "react";

import type {
  Ref
} from "react";

import useInit from "./useInit";
import useDraw from './useDraw';

export interface SignaturePadProps {
  onChange?: (blob: Blob) => void;
  onStart?: () => void;
  height?: number ;
  width?: number ;
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
  onChange: onSignatureChange,
  height,
  width,
  className, 
  blobFormat = "png", 
  strokeColor = "#000"
}: SignaturePadProps) {

  const {
    draw, canvasRef,  setHasDrawn, endDrawing, startDrawing
  } = useDraw({
    onChange: onSignatureChange, blobFormat
  });

  useInit({
    height, width, strokeColor,canvasRef
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
