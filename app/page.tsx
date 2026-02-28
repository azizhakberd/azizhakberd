"use client";
import Window from "./Window";
import Pad from "./Pad";
import Boundary from "./Boundary";
import { usePopup } from "./PopupContext";

export default function Home() {
    const { addPopup } = usePopup();

    return (
        <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
            <h1>Hello, GitHub Pages!</h1>
            <p>This is a static Next.js site deployed via GitHub Actions.</p>
            <button onClick={() => addPopup("This is a popup message!")} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Show Popup
            </button>
            <Boundary>
                <Window>Hello World</Window>
                <Pad>I am on a Pad</Pad>
            </Boundary>
        </main>
    );
}