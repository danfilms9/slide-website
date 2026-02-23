import dynamic from "next/dynamic";

const Scene = dynamic(
  () =>
    import("@/app/components/three/Scene").then((mod) => ({ default: mod.Scene })),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="fixed inset-0 w-full h-full overflow-hidden">
      <Scene />
    </main>
  );
}
