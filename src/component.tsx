
import React, {
  useRef, useEffect, useState
} from "react";
  
// generated via CoPilot
// originally tried using react-signature-canvas package but
// current alpha version (works with React v19) has bugs
export default function SignaturePad ({
  onSignatureChange, height 
}:{ onSignatureChange: (blob: Blob) => void,
  height: number|null }) {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Tracks if drawing is in progress
  const [drawing, setDrawing] = useState(false);
  
  // Tracks if any drawing has occurred
  const [hasDrawn, setHasDrawn] = useState(false);
  
  // Set up the canvas context properties when the component mounts
  useEffect(() => {

    const ctx = canvasRef.current?.getContext("2d");
    
    if (!ctx)
      return;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
  }, []);
  
  // Starts drawing on the canvas
  const startDrawing = (e:
  React.MouseEvent<HTMLCanvasElement> | 
  React.TouchEvent<HTMLCanvasElement>) => {
    // Get the position of the event relative to the canvas
    const {
      offsetX, offsetY 
    } = getEventPosition(e);
   
    const ctx = canvasRef.current?.getContext("2d");

    if(!ctx)
      return;

    ctx.beginPath();
    // Move the drawing cursor to the event position
    ctx.moveTo(offsetX, offsetY);

    // update setDrawing so dependent methods 
    // know a drawing is in progress
    setDrawing(true);
    // Reset the drawing flag, should be set to true
    // when drawing has completed
    setHasDrawn(false);
  };
  
  // Draws on the canvas
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | 
    React.TouchEvent<HTMLCanvasElement>) => {
    // If drawing is not in progress, exit the function
    if (!drawing) return;

    const position = getEventPosition(e);

    if (!position) 
      return;

    // Get the position of the event relative to the canvas
    const {
      offsetX, offsetY 
    } = position;

    const ctx = canvasRef.current?.getContext("2d");

    if(!ctx)
      return; 

    // Draw a line to the event position
    ctx.lineTo(offsetX, offsetY);
    // Render the drawing on the canvas
    ctx.stroke();
    // Mark that drawing occurred
    setHasDrawn(true);
  };
  
  // Ends drawing on the canvas
  const endDrawing = () => {
    // Drawing is complete, so update state
    // accordingly
    setDrawing(false);

    const ctx = canvasRef.current?.getContext("2d");

    if(!ctx)
      return; 

    ctx.closePath();

    // If something was drawn, emit the blob
    if (hasDrawn) {
      emitBlob();
    }
  };
  
  // Returns the position of the event relative to the canvas
  const getEventPosition = (e: React.TouchEvent<HTMLCanvasElement> | 
    React.MouseEvent<HTMLCanvasElement>) => {

    const canvas = canvasRef.current;

    if (!canvas) 
      return null;

    let clientX,clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    else{
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rectangle = canvas.getBoundingClientRect();

    return {
      offsetX: clientX - rectangle.left,
      offsetY: clientY - rectangle.top,
    };
  };

  // Returns the canvas contents as a png blob
  const emitBlob = () => {

    if (!canvasRef.current) 
      return;

    canvasRef.current.toBlob((blob) => {
      // If the onSignatureChange callback is provided,
      // pass the blob to it
      if (onSignatureChange && blob) {
        onSignatureChange(blob);
      }
    }, "image/png");
  };
  

  return (
    <div>
      <canvas
        height={ height ?? 200 }
        onMouseDown={ startDrawing }
        onMouseLeave={ endDrawing }
        onMouseMove={ draw }
        onMouseUp={ endDrawing }
        onTouchEnd={ endDrawing }
        onTouchMove={ draw }
        onTouchStart={ startDrawing }
        ref={ canvasRef }
        style={ {
          touchAction: "none" 
        } }
        width={ 500 }
      />
    </div>
  );

  
};
  
