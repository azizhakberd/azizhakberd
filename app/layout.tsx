import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google"
import { PopupProvider } from "./PopupContext";

export const metadata: Metadata = {
    title: "Aziz Hakberdiev",
    description: "The living page",
};

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "700"]
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={roboto.className}>
            <body>
                <PopupProvider>{children}</PopupProvider>
            </body>
        </html>
    );
}