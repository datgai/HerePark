import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminLayout from "./pages/admin/Adminlayout";
import Admin from "./pages/admin/Admin";
import Parking from "./pages/admin/parking/Parking";

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminLayout />}>
          {/* Nested routes go here */}
          <Route index element={<Admin />} /> {/* matches /admin */}
          <Route path="parking" element={<Parking />} />{" "}
          {/* matches /admin/parking */}
        </Route>
      </Routes>
    </main>
  );
}

export default App;
