import {
  useEffect, type RefObject
} from "react";
  
interface hookProps{
  height?: number; 
  width?: number;  
  strokeColor: `#${string}`;
  canvasRef: RefObject<HTMLCanvasElement|null> ; // Allow null for initial render
}
  
/**
 * Initializes the canvas: Sets the canvas size, 
 * scales the context for devicePixelRatio, and applies default stroke styles.
 */
export default function useInit({
  height, width, strokeColor, canvasRef
}: hookProps) {

  useEffect(() => {

    if (canvasRef.current === null) 
      return;

    const canvas = canvasRef.current;
   
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Account for high-resolution screens
    const dpr = window.devicePixelRatio || 1;

    // Use passed-in width/height, or fallback to defaults
    const canvasWidth = width ?? 400;
    const canvasHeight = height ?? 400;

    // Set internal pixel dimensions for HiDPI rendering
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // Set visible size for layout (CSS pixels)
    // ensure canvas appears at intended size regardless of internal resolution
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Scale drawing operations to match physical pixel density
    ctx.scale(dpr, dpr);

    // Configure default drawing style
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = strokeColor ;
  }, [width, height, strokeColor, canvasRef]);

}