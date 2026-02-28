import React from "react";
import Window from "./Window";

interface PadProps {
    width?: number;
    height?: number;
    children?: React.ReactNode;
    initialX?: number;
    initialY?: number;
}

export default function Pad({ width = 300, height = 200, children, initialX = 0, initialY = 0 }: PadProps) {
    return (
        <>
            <div style={{ width: 0, height: 0, position: "relative", overflow: "visible" }}>
                <Window width={width} height={height} initialX={initialX} initialY={initialY}>
                    {children}
                </Window>
            </div>
            <div style={{width, height}}></div>
        </>
    );
}
