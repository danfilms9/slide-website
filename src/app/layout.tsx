import "./globals.css";
import { SceneLayout } from "./components/SceneLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SceneLayout>{children}</SceneLayout>
      </body>
    </html>
  );
}
