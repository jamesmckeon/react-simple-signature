import {
  useImperativeHandle,
} from "react";

import type {
  Ref
} from "react";

import useInit from "./useInit";
import useDraw from './useDraw';

export interface SimpleSignatureProps {
  /**
   * Called when the user modifies the drawing; returns a blob of the new drawing
   * @param blob 
   * @returns 
   */
  onChange?: (blob: Blob) => void;
  /**
   * Called when the user starts drawing
   * @returns 
   */
  onStart?: () => void;
  height?: number ;
  width?: number ;
  className?: string;
  ref?: Ref<SignatureRef>; 
  blobFormat?: "png" | "jpeg";
  strokeColor?: `#${string}`;
} 

export interface SignatureRef {
  clear: () => void;
}

/**
 * SimpleSignature is a functional component for that captures user-drawn lines.
 * It supports mouse and touch input, emits a blob when drawing ends, and can be cleared via ref.
 */
export default function SimpleSignature({
  ref,
  onChange: onSignatureChange,
  height,
  width,
  className, 
  blobFormat = "png", 
  strokeColor = "#000",
  onStart
}: SimpleSignatureProps) {

  const {
    draw, canvasRef,  clear, endDrawing, startDrawing
  } = useDraw({
    onChange: onSignatureChange, blobFormat, onStart
  });

  useInit({
    height, width, strokeColor,canvasRef, className
  });

  // Expose a clear() method to parent components via ref
  useImperativeHandle(ref, () => ({
    clear
  }));

  return (
    <canvas
      aria-label={
        "Signature input area. Use your mouse or touch " +
        "to draw your signature."
      }
      onMouseDown={startDrawing}
      onMouseLeave={endDrawing} // finalize drawing if pointer leaves canvas
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onTouchCancel={endDrawing}
      onTouchEnd={endDrawing}
      onTouchMove={draw}
      onTouchStart={startDrawing} 
      ref={canvasRef}
      style={{
        touchAction: "none" // prevent scrolling during touch drawing
      }}
    />
 
  );
}
