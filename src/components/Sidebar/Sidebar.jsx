import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [workPermitOpen, setWorkPermitOpen] = useState(
    location.pathname.startsWith("/work-permits") ||
    location.pathname.startsWith("/work-permits/country") ||
    location.pathname.startsWith("/work-permits/feetiers") ||
    location.pathname.startsWith("/work-permits/documents") ||
    location.pathname.startsWith("/work-permits/payment") ||
    location.pathname.startsWith("/work-permits/status-history")
  );

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

  const isWorkPermitActive = () => {
    return (
    location.pathname.startsWith("/work-permits") ||
    location.pathname.startsWith("/work-permits/country") ||
    location.pathname.startsWith("/work-permits/feetiers") ||
    location.pathname.startsWith("/work-permits/documents") ||
    location.pathname.startsWith("/work-permits/payment") ||
    location.pathname.startsWith("/work-permits/status-history")
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
          className={`menu-item ${location.pathname === "/dashboard" ? "active" : ""
            }`}
          onClick={() => navigate("/dashboard")}
        >
          <span className="menu-icon">▦</span>
          <span>Dashboard</span>
        </button>

        <button
          className={`menu-item ${isActive("/categories") ? "active" : ""
            }`}
          onClick={() => navigate("/categories")}
        >
          <span className="menu-icon">◫</span>
          <span>Categories</span>
        </button>

        {/* PACKAGES DROPDOWN */}

        <div className="sidebar-dropdown">
          <button
            className={`menu-item ${isPackageActive() ? "active" : ""
              }`}
            onClick={() => setPackageOpen(!packageOpen)}
          >
            <span className="menu-icon">◆</span>
            <span className="menu-label">Packages</span>

            <span
              className={`dropdown-arrow ${packageOpen ? "open" : ""
                }`}
            >
              ▼
            </span>
          </button>

          {packageOpen && (
            <div className="submenu">
              <button
                className={`submenu-item ${location.pathname === "/packages" ? "active" : ""
                  }`}
                onClick={() => navigate("/packages")}
              >
                All Packages
              </button>

              <button
                className={`submenu-item ${isActive("/packages/inclusions") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/inclusions")}
              >
                Inclusions
              </button>

              <button
                className={`submenu-item ${isActive("/packages/exclusions") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/exclusions")}
              >
                Exclusions
              </button>

              <button
                className={`submenu-item ${isActive("/packages/restrictions") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/restrictions")}
              >
                Restrictions
              </button>

              <button
                className={`submenu-item ${isActive("/packages/what-to-bring") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/what-to-bring")}
              >
                What to Bring
              </button>

              <button
                className={`submenu-item ${isActive("/packages/faqs") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/faqs")}
              >
                FAQs
              </button>

              <button
                className={`submenu-item ${isActive("/packages/pricing-tiers") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/pricing-tiers")}
              >
                Pricing Tiers
              </button>

              <button
                className={`submenu-item ${isActive("/packages/itineraries") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/itineraries")}
              >
                Itineraries
              </button>

              <button
                className={`submenu-item ${isActive("/packages/testimonials") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/testimonials")}
              >
                Testimonials
              </button>

              <button
                className={`submenu-item ${isActive("/packages/gallery") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/gallery")}
              >
                Gallery
              </button>

              <button
                className={`submenu-item ${isActive("/packages/highlights") ? "active" : ""
                  }`}
                onClick={() => navigate("/packages/highlights")}
              >
                Highlights
              </button>
            </div>
          )}
        </div>

        <button
          className={`menu-item ${isActive("/vehicles") ? "active" : ""
            }`}
          onClick={() => navigate("/vehicles")}
        >
          <span className="menu-icon">▤</span>
          <span>Vehicles</span>
        </button>

        <button
          className={`menu-item ${isActive("/helis") ? "active" : ""
            }`}
          onClick={() => navigate("/helis")}
        >
          <span className="menu-icon">✈</span>
          <span>Helis</span>
        </button>

        <button
          className={`menu-item ${isActive("/bookings") ? "active" : ""
            }`}
          onClick={() => navigate("/bookings")}
        >
          <span className="menu-icon">▣</span>
          <span>Bookings</span>
        </button>

        {/* WORK PERMIT DROPDOWN */}

        <div className="sidebar-dropdown">
          <button
            className={`menu-item ${isWorkPermitActive() ? "active" : ""
              }`}
            onClick={() => setWorkPermitOpen(!workPermitOpen)}
          >
            <span className="menu-icon">◆</span>
            <span className="menu-label">Work Permit</span>

            <span
              className={`dropdown-arrow ${workPermitOpen ? "open" : ""
                }`}
            >
              ▼
            </span>
          </button>

          {workPermitOpen && (
            <div className="submenu">
              <button
                className={`submenu-item ${location.pathname === "/work-permits" ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits")}
              >
                All Work Permits
              </button>

              <button
                className={`submenu-item ${isActive("/work-permits/country") ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits/country")}
              >
                Country
              </button>

              <button
                className={`submenu-item ${isActive("/work-permits/requirements") ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits/feetiers")}
              >
                Fee Tiers
              </button>

              <button
                className={`submenu-item ${isActive("/work-permits/documents") ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits/documents")}
              >
                Documents
              </button>

              <button
                className={`submenu-item ${isActive("/work-permits/faqs") ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits/payment")}
              >
                Payments
              </button>

              <button
                className={`submenu-item ${isActive("/work-permits/pricing") ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits/status-history")}
              >
                Status History
              </button>
            </div>
          )}
        </div>

        <button
          className={`menu-item ${isActive("/users") ? "active" : ""
            }`}
          onClick={() => navigate("/users")}
        >
          <span className="menu-icon">♙</span>
          <span>Users</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`menu-item ${isActive("/settings") ? "active" : ""
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