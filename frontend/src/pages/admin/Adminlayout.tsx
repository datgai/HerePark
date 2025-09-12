import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import styles from "./Adminlayout.module.css";

function AdminLayout() {
  return (
    <div className={styles.admin}>
      <Navbar />
      <Outlet />
    </div>
  );
}

export default AdminLayout;
