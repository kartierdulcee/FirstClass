export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="mt-2 text-neutral-300">Your cross-channel automations, at a glance.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card title="Queue" value="48 posts" />
        <Card title="DM Follow-ups" value="312 pending" />
        <Card title="Appointments" value="21 this week" />
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="text-sm text-neutral-400">{title}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}
