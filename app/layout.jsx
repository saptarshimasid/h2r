import "locomotive-scroll/dist/locomotive-scroll.css";
import "./globals.css";

export const metadata = {
  title: "Ninja H2R — Beyond Fast",
  description:
    "An independent design concept exploring the Kawasaki Ninja H2R: supercharged engineering, carbon-fiber aerodynamics, and the sound of speed.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
