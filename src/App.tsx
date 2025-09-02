export default function App() {
  return (
    <div className="min-h-dvh grid place-items-center bg-neutral-950 text-neutral-100">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-[hsl(var(--brand))]">First</span>Class Franchise AI
        </h1>
        <p className="mt-2 text-neutral-300">
          Tailwind is live if this text is gray and the background is dark.
        </p>
        <button className="mt-6 rounded-2xl px-4 py-2 bg-[hsl(var(--brand))] text-white font-semibold border border-neutral-800">
          Get Started
        </button>
      </div>
    </div>
  );
}
