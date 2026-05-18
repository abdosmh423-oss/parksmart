"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type ParkingSlot = {
  id: number;
  name: string;
  price: number;
  is_available: boolean;
};

export default function Dashboard() {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment Modal State
  const [checkoutSlot, setCheckoutSlot] = useState<ParkingSlot | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchParkingSlots();
  }, []);

  const fetchParkingSlots = async () => {
    const { data, error } = await supabase.from("parking_slots").select("*").order("id");
    if (!error) setSlots(data || []);
    setLoading(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutSlot) return;
    
    setProcessing(true);

    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in first!");
      router.push("/");
      return;
    }

    // Simulate a 1.5 second payment processing delay (looks great on video!)
    setTimeout(async () => {
      // 2. Add reservation
      await supabase.from("reservations").insert({ user_id: user.id, slot_id: checkoutSlot.id, status: "active" });

      // 3. Mark occupied
      await supabase.from("parking_slots").update({ is_available: false }).eq("id", checkoutSlot.id);

      setProcessing(false);
      setCheckoutSlot(null);
      alert(`✅ Payment of $${checkoutSlot.price.toFixed(2)} successful! Spot Reserved.`);
      fetchParkingSlots();
    }, 1500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">ParkSmart <span className="text-gray-800">Dashboard</span></h1>
          <button onClick={handleLogout} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition">
            Log Out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 font-medium animate-pulse">Syncing live parking data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div key={slot.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{slot.name}</h3>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded font-bold">
                      {Math.floor(Math.random() * 5) + 1}.{Math.floor(Math.random() * 9)} miles away
                    </span>
                  </div>
                  <p className="text-3xl font-black text-gray-800 mb-6">${slot.price.toFixed(2)} <span className="text-sm text-gray-400 font-normal">/hr</span></p>
                  
                  <div className="mb-6">
                    {slot.is_available ? (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold flex inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Available
                      </span>
                    ) : (
                      <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-bold flex inline-flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-red-500"></span> Occupied
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setCheckoutSlot(slot)}
                  disabled={!slot.is_available}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                    slot.is_available ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-200 cursor-not-allowed text-gray-400'
                  }`}
                >
                  {slot.is_available ? "Reserve Spot" : "Space Full"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAKE PAYMENT MODAL */}
      {checkoutSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <p className="text-blue-100 mt-1">Completing reservation for {checkoutSlot.name}</p>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Total Amount Due:</span>
                <span className="text-2xl font-black text-gray-900">${checkoutSlot.price.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Card Number</label>
                <input type="text" placeholder="•••• •••• •••• 4242" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Expiry</label>
                  <input type="text" placeholder="MM/YY" required className="w-full p-3 border border-gray-300 rounded-xl outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">CVC</label>
                  <input type="text" placeholder="123" required className="w-full p-3 border border-gray-300 rounded-xl outline-none" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setCheckoutSlot(null)}
                  className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processing}
                  className="flex-[2] bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:bg-blue-400 flex justify-center items-center"
                >
                  {processing ? "Processing..." : "Pay & Reserve"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}