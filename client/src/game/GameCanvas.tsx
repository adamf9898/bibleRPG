import React, { useRef, useEffect } from "react";

interface GameCanvasProps {
    width?: number;
    height?: number;
    onInit?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const GameCanvas: React.FC<GameCanvasProps> = ({
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    onInit,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx && onInit) {
                onInit(ctx, canvas);
            }
        }
    }, [onInit]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                display: "block",
                background: "#222",
                border: "1px solid #444",
                margin: "0 auto",
            }}
            tabIndex={0}
        />
    );
};

export default GameCanvas;