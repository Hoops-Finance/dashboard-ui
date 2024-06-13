import Navbar from '../components/Navbar';

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <main className="flex flex-col items-center justify-start p-6 bg-white">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </main>
    </div>
  );
}