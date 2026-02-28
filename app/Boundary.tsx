"use client";
import React, { useRef, createContext, useContext, ReactNode, useState, useCallback } from "react";

interface BoundaryContextType {
    boundaryRef: React.RefObject<HTMLDivElement>;
    registerWindow: (id: string) => void;
    unregisterWindow: (id: string) => void;
    bringToFront: (id: string) => void;
    windowOrder: string[];
}

const BoundaryContext = createContext<BoundaryContextType | null>(null);

export const useBoundary = () => {
    const context = useContext(BoundaryContext);
    if (!context) {
        throw new Error("Window must be used within a Boundary");
    }
    return context;
};

interface BoundaryProps {
    width?: number,
    height?: number,
    children?: ReactNode;
}

export default function Boundary({ width, height, children }: BoundaryProps) {
    const boundaryRef = useRef<HTMLDivElement>(null);
    const [windowOrder, setWindowOrder] = useState<string[]>([]);

    const registerWindow = useCallback((id: string) => {
        setWindowOrder((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    }, []);

    const unregisterWindow = useCallback((id: string) => {
        setWindowOrder((prev) => prev.filter((windowId) => windowId !== id));
    }, []);

    const bringToFront = useCallback((id: string) => {
        setWindowOrder((prev) => {
            if (prev.length > 0 && prev[prev.length - 1] === id) return prev;
            const newOrder = prev.filter((windowId) => windowId !== id);
            newOrder.push(id);
            return newOrder;
        });
    }, []);

    return (
        <BoundaryContext.Provider value={{ boundaryRef, registerWindow, unregisterWindow, bringToFront, windowOrder }}>
            <div
                ref={boundaryRef}
                className="boundary"
                style={{
                    width: width ?? "100%",
                    height: height ?? "100%",
                    position: "relative",
                    overflow: "hidden",
                    border: "2px solid #111"
                }}
            >
                {children}
            </div>
        </BoundaryContext.Provider>
    );
}