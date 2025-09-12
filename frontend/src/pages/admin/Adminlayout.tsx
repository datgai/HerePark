import { Outlet, Link } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <nav className="flex gap-4 mt-2">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/parking">Parking</Link>
        </nav>
      </header>

      {/* This is where nested routes will render */}
      <Outlet />
    </div>
  );
}

export default AdminLayout;
