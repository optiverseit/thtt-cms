import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [packageOpen, setPackageOpen] = useState(
    location.pathname.startsWith("/packages") ||
    location.pathname.startsWith("/packages/inclusions") ||
    location.pathname.startsWith("/packages/exclusions") ||
    location.pathname.startsWith("/packages/restrictions") ||
    location.pathname.startsWith("/packages/what-to-bring") ||
    location.pathname.startsWith("/packages/faqs") ||
    location.pathname.startsWith("/packages/pricing-tiers") ||
    location.pathname.startsWith("/packages/itineraries") ||
    location.pathname.startsWith("/packages/testimonials") ||
    location.pathname.startsWith("/packages/gallery") ||
    location.pathname.startsWith("/packages/highlights")
  );

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const isPackageActive = () => {
    return (
      location.pathname.startsWith("/packages") ||
      location.pathname.startsWith("/packages/inclusions") ||
      location.pathname.startsWith("/packages/exclusions") ||
      location.pathname.startsWith("/packages/restrictions") ||
      location.pathname.startsWith("/packages/what-to-bring") ||
      location.pathname.startsWith("/packages/faqs") ||
      location.pathname.startsWith("/packages/pricing-tiers") ||
      location.pathname.startsWith("/packages/itineraries") ||
      location.pathname.startsWith("/packages/testimonials") ||
      location.pathname.startsWith("/packages/gallery") ||
      location.pathname.startsWith("/packages/highlights")
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
                  isActive("/packages/inclusions") ? "active" : ""
                }`}
                onClick={() => navigate("/packages/inclusions")}
              >
                Inclusions
              </button>

              <button
                className={`submenu-item ${
                  isActive("/packages/exclusions") ? "active" : ""
                }`}
                onClick={() => navigate("/packages/exclusions")}
              >
                Exclusions
              </button>

              <button
                className={`submenu-item ${
                  isActive("/packages/restrictions") ? "active" : ""
                }`}
                onClick={() => navigate("/packages/restrictions")}
              >
                Restrictions
              </button>

              <button
                className={`submenu-item ${
                  isActive("/packages/what-to-bring") ? "active" : ""
                }`}
                onClick={() => navigate("/packages/what-to-bring")}
              >
                What to Bring
              </button>

              <button
                className={`submenu-item ${
                  isActive("/packages/faqs") ? "active" : ""
                }`}
                onClick={() => navigate("/packages/faqs")}
              >
                FAQs
              </button>

              <button
                className={`submenu-item ${
                  isActive("/packages/pricing-tiers") ? "active" : ""
                }`}
                onClick={() => navigate("/packages/pricing-tiers")}
              >
                Pricing Tiers
              </button>

              <button
                className={`submenu-item ${
                  isActive("/packages/itineraries") ? "active" : ""
                }`}
                onClick={() => navigate("/packages/itineraries")}
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