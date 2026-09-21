import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">▲</div>

        <div className="sidebar-brand-text">
          <h2>Trip Himalaya</h2>
          <span>CMS</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`menu-item ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <span className="menu-icon">▦</span>
          <span>Dashboard</span>
        </button>

        <button
          className={`menu-item ${
            isActive("/categories") ? "active" : ""
          }`}
          onClick={() => navigate("/categories")}
        >
          <span className="menu-icon">◫</span>
          <span>Categories</span>
        </button>

        <button
          className={`menu-item ${
            isActive("/packages") ? "active" : ""
          }`}
          onClick={() => navigate("/packages")}
        >
          <span className="menu-icon">◆</span>
          <span>Packages</span>
        </button>

         <button
          className={`menu-item ${
            isActive("/vehicles") ? "active" : ""
          }`}
          onClick={() => navigate("/vehicles")}
        >
          <span className="menu-icon">▤</span>
          <span>Vehicles</span>
        </button>

        <button
          className={`menu-item ${
            isActive("/helis") ? "active" : ""
          }`}
          onClick={() => navigate("/helis")}
        >
          <span className="menu-icon">✈</span>
          <span>Helis</span>
        </button>

        <button
          className={`menu-item ${
            isActive("/bookings") ? "active" : ""
          }`}
          onClick={() => navigate("/bookings")}
        >
          <span className="menu-icon">▣</span>
          <span>Bookings</span>
        </button>

        <button
          className={`menu-item ${
            isActive("/users") ? "active" : ""
          }`}
          onClick={() => navigate("/users")}
        >
          <span className="menu-icon">♙</span>
          <span>Users</span>
        </button>

      </nav>

      <div className="sidebar-bottom">
        <button
          className={`menu-item ${
            isActive("/settings") ? "active" : ""
          }`}
          onClick={() => navigate("/settings")}
        >
          <span className="menu-icon">⚙</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;