import { InteractiveFloorBento } from "@/components/interactive-floor-bento";

export default function LiveFeedPage() {
  return (
    <main className="p-4">
      <h1 className="mt-8 ml-10 text-3xl text-neutral-300 font-bold">Building Floor Interactive Map</h1>
      <InteractiveFloorBento />
    </main>
  );
}