import {
  useEffect
} from "react";
  
interface hookProps{
  height?: number; // Make optional instead of nullable
  width?: number;  // Make optional instead of nullable
  strokeColor: `#${string}`;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}
  
export default function useInit({
  height, width, strokeColor, canvasRef
}: hookProps) {

  useEffect(() => {

    const canvas = canvasRef?.current;

    if(!canvas) 
      return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine device pixel ratio (for HiDPI screens)
    const dpr = window.devicePixelRatio || 1;

    // Use passed-in width/height, or fallback to defaults
    const canvasWidth = width ?? 400;
    const canvasHeight = height ?? 400;

    // Set the actual pixel size of the canvas for high-DPI accuracy
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // Set the visible (CSS) size of the canvas
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Scale the drawing context to match the pixel ratio
    ctx.scale(dpr, dpr);

    // Set default drawing styles
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = strokeColor ;
  }, [width, height, strokeColor, canvasRef]);

}