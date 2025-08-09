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

/**
 * Hook for handling smooth canvas-based drawing, touch/mouse support, and emitting a blob image.
 * Supports consumer callbacks for draw start and completion.
 */
export default function useDraw({
  onChange, blobFormat, onStart
}: useDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Tracks whether the user is currently drawing on the canvas
  const [drawing, setDrawing] = useState(false);

  // Tracks whether any drawing has occurred (used to decide if a blob should be emitted)
  const [hasDrawn, setHasDrawn] = useState(false);

  // Last recorded point used for smoothing with quadratic curves
  const [lastPoint, setLastPoint] = useState<{
    x: number; y: number 
  } | null>(null);

  /**
   * Returns canvas-relative coordinates for a mouse or touch event.
   * Returns null if canvas isn't ready.
   */
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

  /**
   * Draws a smooth line from the last point to the current event position.
   * No-ops if drawing hasn't started or the canvas is unavailable.
   */
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

  /**
   * Begins a new drawing path at the current event position.
   * Invokes onStart callback if provided.
   */
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
    setHasDrawn(true);
    setLastPoint({
      x: offsetX, y: offsetY 
    });

    if( onStart)
      onStart();
  };

  /**
   * Emits the current canvas contents as a Blob to the onChange callback.
   */
  const emitBlob = () => {
    if (!canvasRef.current || !onChange) return;

    canvasRef.current.toBlob((blob) => {
      if (blob === null) return;
      onChange(blob);
    }, `image/${blobFormat}`);
  };

  /**
   * Ends the current stroke and emits a blob if anything was drawn.
   */
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

  /**
   * Clears the canvas and resets internal state.
   */
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // 🧽
    setLastPoint(null);
    setHasDrawn(false); // 🧠
    setDrawing(false);
  };

  return {
    draw,
    canvasRef,
    endDrawing,
    startDrawing,
    clear
  };
}