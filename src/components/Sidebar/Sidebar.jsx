import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [packageOpen, setPackageOpen] = useState(
    location.pathname.startsWith("/packages") ||
    location.pathname.startsWith("/inclusions") ||
    location.pathname.startsWith("/exclusions") ||
    location.pathname.startsWith("/restrictions") ||
    location.pathname.startsWith("/what-to-bring") ||
    location.pathname.startsWith("/faqs") ||
    location.pathname.startsWith("/pricing-tiers") ||
    location.pathname.startsWith("/itineraries") ||
    location.pathname.startsWith("/testimonials") ||
    location.pathname.startsWith("/gallery") ||
    location.pathname.startsWith("/highlights")
  );

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const isPackageActive = () => {
    return (
      location.pathname.startsWith("/packages") ||
      location.pathname.startsWith("/inclusions") ||
      location.pathname.startsWith("/exclusions") ||
      location.pathname.startsWith("/restrictions") ||
      location.pathname.startsWith("/what-to-bring") ||
      location.pathname.startsWith("/faqs") ||
      location.pathname.startsWith("/pricing-tiers") ||
      location.pathname.startsWith("/itineraries") ||
      location.pathname.startsWith("/testimonials") ||
      location.pathname.startsWith("/gallery") ||
      location.pathname.startsWith("/highlights")
    );
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

        {/* PACKAGES DROPDOWN */}

        <div className="sidebar-dropdown">
          <button
            className={`menu-item ${
              isPackageActive() ? "active" : ""
            }`}
            onClick={() => setPackageOpen(!packageOpen)}
          >
            <span className="menu-icon">◆</span>
            <span className="menu-label">Packages</span>

            <span
              className={`dropdown-arrow ${
                packageOpen ? "open" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {packageOpen && (
            <div className="submenu">
              <button
                className={`submenu-item ${
                  location.pathname === "/packages" ? "active" : ""
                }`}
                onClick={() => navigate("/packages")}
              >
                All Packages
              </button>

              <button
                className={`submenu-item ${
                  isActive("/inclusions") ? "active" : ""
                }`}
                onClick={() => navigate("/inclusions")}
              >
                Inclusions
              </button>

              <button
                className={`submenu-item ${
                  isActive("/exclusions") ? "active" : ""
                }`}
                onClick={() => navigate("/exclusions")}
              >
                Exclusions
              </button>

              <button
                className={`submenu-item ${
                  isActive("/restrictions") ? "active" : ""
                }`}
                onClick={() => navigate("/restrictions")}
              >
                Restrictions
              </button>

              <button
                className={`submenu-item ${
                  isActive("/what-to-bring") ? "active" : ""
                }`}
                onClick={() => navigate("/what-to-bring")}
              >
                What to Bring
              </button>

              <button
                className={`submenu-item ${
                  isActive("/faqs") ? "active" : ""
                }`}
                onClick={() => navigate("/faqs")}
              >
                FAQs
              </button>

              <button
                className={`submenu-item ${
                  isActive("/pricing-tiers") ? "active" : ""
                }`}
                onClick={() => navigate("/pricing-tiers")}
              >
                Pricing Tiers
              </button>

              <button
                className={`submenu-item ${
                  isActive("/itineraries") ? "active" : ""
                }`}
                onClick={() => navigate("/itineraries")}
              >
                Itineraries
              </button>

              <button
                className={`submenu-item ${
                  isActive("/testimonials") ? "active" : ""
                }`}
                onClick={() => navigate("/testimonials")}
              >
                Testimonials
              </button>

              <button
                className={`submenu-item ${
                  isActive("/gallery") ? "active" : ""
                }`}
                onClick={() => navigate("/gallery")}
              >
                Gallery
              </button>

              <button
                className={`submenu-item ${
                  isActive("/highlights") ? "active" : ""
                }`}
                onClick={() => navigate("/highlights")}
              >
                Highlights
              </button>
            </div>
          )}
        </div>

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