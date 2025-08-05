import {
  useState, useRef 
} from "react";

import type {
  MouseEvent,
  TouchEvent 
} from "react";

interface useDrawProps {
  onChange?: (blob: Blob) => void;
  onStart?: () => void;
  blobFormat?: "png" | "jpeg";
}

// Custom hook for managing drawing behavior on a canvas, 
// including tracking state and emitting an image blob when drawing ends.
export default function useDraw({
  onChange, blobFormat, onStart
}: useDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tracks whether the user is currently drawing on the canvas
  const [drawing, setDrawing] = useState(false);

  // Tracks whether any drawing has occurred (used to decide if a blob should be emitted)
  const [hasDrawn, setHasDrawn] = useState(false);

  // Stores the last recorded point during drawing,
  // used to smooth the line using quadratic curves
  const [lastPoint, setLastPoint] = useState<{
    x: number; y: number 
  } | null>(null);

  // Determines the (x, y) position on the canvas from a touch or mouse event
  const getEventPosition = (
    e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>
  ): {
    offsetX: number, offsetY: number
  } | null => {
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

  // Draws a smooth line to the current cursor/touch position using quadratic curves
  const draw = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    if (!drawing) return;

    const position = getEventPosition(e);

    // if coordinates haven't been set, exit
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

  // Starts a new path for drawing when the user begins a stroke
  const startDrawing = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    const position = getEventPosition(e);
    if (position === null) return;

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

    if( onStart)
      onStart();
  };

  // Emits the current canvas content as a Blob using the specified image format
  const emitBlob = () => {
    if (!canvasRef.current || !onChange) return;

    canvasRef.current.toBlob((blob) => {
      if (blob === null) return;
      onChange(blob);
    }, `image/${blobFormat}`);
  };

  // Ends the current drawing session and emits a blob if drawing occurred
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

  return {
    draw,
    canvasRef,
    setHasDrawn,
    endDrawing,
    startDrawing,
  };
}