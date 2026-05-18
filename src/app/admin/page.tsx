"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from("parking_slots").select("*");
    if (data) {
      setStats({
        total: data.length,
        occupied: data.filter(s => !s.is_available).length,
        available: data.filter(s => s.is_available).length
      });
    }
  };

  const addDummySlot = async () => {
    setAdding(true);
    const newSlot = {
      name: `New Zone - Spot ${Math.floor(Math.random() * 99)}`,
      price: Math.floor(Math.random() * 15) + 5, // Random price $5 to $20
      is_available: true
    };
    
    await supabase.from("parking_slots").insert([newSlot]);
    await fetchStats();
    setAdding(false);
    alert("New parking spot added to the live database!");
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-wider">ParkSmart <span className="text-blue-500">ADMIN</span></h1>
          <button onClick={() => router.push("/dashboard")} className="text-slate-300 hover:text-white underline">
            Back to User View
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <h3 className="text-slate-400 font-bold mb-2 uppercase tracking-wide text-sm">Total Spaces</h3>
            <p className="text-4xl font-black text-white">{stats.total}</p>
          </div>
          <div className="bg-emerald-900/30 p-6 rounded-xl border border-emerald-800 text-center">
            <h3 className="text-emerald-400 font-bold mb-2 uppercase tracking-wide text-sm">Available</h3>
            <p className="text-4xl font-black text-emerald-300">{stats.available}</p>
          </div>
          <div className="bg-red-900/30 p-6 rounded-xl border border-red-800 text-center">
            <h3 className="text-red-400 font-bold mb-2 uppercase tracking-wide text-sm">Occupied</h3>
            <p className="text-4xl font-black text-red-300">{stats.occupied}</p>
          </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Location Administration</h2>
          <p className="text-slate-400 mb-6">Use this tool to provision new smart-sensors to the network grid.</p>
          
          <button 
            onClick={addDummySlot}
            disabled={adding}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-500 transition disabled:opacity-50"
          >
            {adding ? "Deploying..." : "+ Add Random Parking Spot"}
          </button>
        </div>
      </div>
    </div>
  );
}