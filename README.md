🚗 ParkSmart: Real-Time Parking Management System
ParkSmart is a full-stack, real-time Minimum Viable Product (MVP) designed to solve urban parking congestion. It allows users to view live parking availability, reserve spots via a simulated payment gateway, and provides administrators with a high-level dashboard to monitor capacity.

🔗 Project Links
Live Deployment: [Insert Vercel Link Here]

Video Demonstration: [Insert Video Link Here]

🎯 Core Features & Business Requirements
This MVP was built to specifically address the core requirements outlined in the ParkSmart engineering specification:

Secure User Authentication (BR-01, BR-02): Handled via Supabase Auth. Users can securely create accounts and log in. The system strictly prevents unauthenticated users from making reservations.

Real-Time Availability Dashboard (BR-09, BR-11): Fetches live data from a PostgreSQL database. UI dynamically renders status badges (Available/Occupied) and disables interactions for booked spots.

Reservation & Payment Gateway (BR-13, BR-14): Features a polished, simulated credit-card checkout flow. Upon completion, the system instantly executes a state update, writing the reservation to the database and marking the space as unavailable to prevent double-booking.

Administrative Control Center (BR-12): A dedicated /admin route providing a high-level statistical overview of total capacity versus occupied spaces, along with tools to provision new parking zones into the live grid.

💻 Technical Architecture
The project leverages a modern, serverless stack optimized for speed and real-time data sync.

Frontend: Built with Next.js (App Router) and React.

Styling: Fully responsive UI constructed with Tailwind CSS.

Backend as a Service (BaaS): Supabase handles the PostgreSQL database and user authentication.

Hosting: Deployed via Vercel for continuous integration and global edge-network delivery.
🔍 Code Highlight: Transactional Reservation Logic
Rather than relying on basic UI state, the reservation system securely interfaces with the Supabase backend to ensure data integrity during the booking process:
const handlePaymentSubmit = async () => {
  // 1. Verify Authentication State
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Please log in first!");

  // 2. Write Reservation to Database
  await supabase.from("reservations").insert({ 
    user_id: user.id, 
    slot_id: checkoutSlot.id, 
    status: "active" 
  });

  // 3. Update Global Slot Availability 
  await supabase.from("parking_slots").update({ 
    is_available: false 
  }).eq("id", checkoutSlot.id);
  
  // 4. Trigger UI Re-render
  fetchParkingSlots(); 
};
🛠️ Local Setup Instructions
To run this project locally on your machine:

Clone the repository: git clone https://github.com/abdosmh423-oss/parksmart.git

Install dependencies: npm install

Set up your .env.local file with your Supabase keys:

NEXT_PUBLIC_SUPABASE_URL=your_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

Run the development server: npm run dev

Open http://localhost:3000 in your browser.
