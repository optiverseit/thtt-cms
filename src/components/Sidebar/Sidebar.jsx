import { useState } from "react";
import { FaThLarge, FaLayerGroup, FaBoxOpen, FaCar, FaHelicopter, FaCalendarCheck, FaGlobeAsia, FaBriefcase, FaPassport, FaShieldAlt, FaHotel, FaFileAlt, FaBookOpen, FaUsers, FaUserShield, FaCog, FaImages } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Role-based sidebar visibility
  const role = (localStorage.getItem("role") || "").toLowerCase().trim();
  const isAdmin = role === "admin";
  const canViewCMS = isAdmin || role === "cms-admin";
  const canViewBooking = isAdmin || role === "booking-admin";
  const canViewServices = canViewCMS || canViewBooking;

  const [workPermitOpen, setWorkPermitOpen] = useState(
    location.pathname.startsWith("/work-permits") ||
    location.pathname.startsWith("/work-permits/country") ||
    location.pathname.startsWith("/work-permits/feetiers") ||
    location.pathname.startsWith("/work-permits/documents") ||
    location.pathname.startsWith("/work-permits/payment") ||
    location.pathname.startsWith("/work-permits/status-history")
  );

  const [visaOpen, setVisaOpen] = useState(
    location.pathname.startsWith("/visa-application") ||
    location.pathname.startsWith("/visa/category") ||
    location.pathname.startsWith("/visa/information") ||
    location.pathname.startsWith("/visa/documents") ||
    location.pathname.startsWith("/visa/pricing-tier")
    // location.pathname.startsWith("/work-permits/payment") ||
  );

  const [insuranceOpen, setInsuranceOpen] = useState(
    location.pathname.startsWith("/insurance-applications") ||
    location.pathname.startsWith("/insurance/plan") ||
    location.pathname.startsWith("/insurance/informations") ||
    location.pathname.startsWith("/insurance/documents") ||
    location.pathname.startsWith("/insurance/pricing-tiers") ||
    location.pathname.startsWith("/insurance/dynamic-fields")
  );

  const [hotelOpen, setHotelOpen] = useState(
    location.pathname.startsWith("/hotel-bookings") ||
    location.pathname.startsWith("/hotels") ||
    location.pathname.startsWith("/hotel/pricing-tiers") ||
    location.pathname.startsWith("/hotel/informations") ||
    location.pathname.startsWith("/hotel/policies") ||
    location.pathname.startsWith("/hotel/testimonials") ||
    location.pathname.startsWith("/hotel/faqs")
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

  const isVisaActive = () => {
    return (
      location.pathname.startsWith("/visa-application") ||
      location.pathname.startsWith("/visa/category") ||
      location.pathname.startsWith("/visa/information") ||
      location.pathname.startsWith("/visa/documents") ||
      location.pathname.startsWith("/visa/pricing-tier")
    );
  };

  const isInsuranceActive = () => {
    return (
      location.pathname.startsWith("/insurance-applications") ||
      location.pathname.startsWith("/insurance/plan") ||
      location.pathname.startsWith("/insurance/informations") ||
      location.pathname.startsWith("/insurance/documents") ||
      location.pathname.startsWith("/insurance/pricing-tiers") ||
      location.pathname.startsWith("/insurance/dynamic-fields")
    );
  };

  const isHotelActive = () => {
    return (
      location.pathname.startsWith("/hotel-bookings") ||
      location.pathname.startsWith("/hotels") ||
      location.pathname.startsWith("/hotel/pricing-tiers") ||
      location.pathname.startsWith("/hotel/informations") ||
      location.pathname.startsWith("/hotel/policies") ||
      location.pathname.startsWith("/hotel/testimonials") ||
      location.pathname.startsWith("/hotel/faqs")
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
          <span className="menu-icon"><FaThLarge /></span>
          <span>Dashboard</span>
        </button>

        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/categories") ? "active" : ""
              }`}
            onClick={() => navigate("/categories")}
          >
            <span className="menu-icon"><FaLayerGroup /></span>
            <span>Categories</span>
          </button>
        )}

        {/* PACKAGES DROPDOWN */}

        {canViewCMS && (
          <div className="sidebar-dropdown">
            <button
              className={`menu-item ${isPackageActive() ? "active" : ""
                }`}
              onClick={() => setPackageOpen(!packageOpen)}
            >
              <span className="menu-icon"><FaBoxOpen /></span>
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
                  className={`submenu-item ${isActive("/packages/policy") ? "active" : ""
                    }`}
                  onClick={() => navigate("/packages/policy")}
                >
                  Policies
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
        )}

        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/vehicles") ? "active" : ""
              }`}
            onClick={() => navigate("/vehicles")}
          >
            <span className="menu-icon"><FaCar /></span>
            <span>Vehicles</span>
          </button>
        )}

        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/helis") ? "active" : ""
              }`}
            onClick={() => navigate("/helis")}
          >
            <span className="menu-icon"><FaHelicopter /></span>
            <span>Helis</span>
          </button>
        )}

        {canViewBooking && (
          <button
            className={`menu-item ${isActive("/bookings") ? "active" : ""
              }`}
            onClick={() => navigate("/bookings")}
          >
            <span className="menu-icon"><FaCalendarCheck /></span>
            <span>Bookings</span>
          </button>
        )}

        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/country") ? "active" : ""
              }`}
            onClick={() => navigate("/country")}
          >
            <span className="menu-icon"><FaGlobeAsia /></span>
            <span>Country</span>
          </button>
        )}

        {/* WORK PERMIT DROPDOWN */}

        {canViewServices && (
          <div className="sidebar-dropdown">
            <button
              className={`menu-item ${isWorkPermitActive() ? "active" : ""
                }`}
              onClick={() => setWorkPermitOpen(!workPermitOpen)}
            >
              <span className="menu-icon"><FaBriefcase /></span>
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
                {canViewBooking && (
                  <button
                    className={`submenu-item ${location.pathname === "/work-permits" ? "active" : ""
                      }`}
                    onClick={() => navigate("/work-permits")}
                  >
                    All Work Permits
                  </button>
                )}

                <button
                  className={`submenu-item ${isActive("/work-permits/highlights") ? "active" : ""
                    }`}
                  onClick={() => navigate("/work-permits/highlights")}
                >
                  WorkPermit Highlights
                </button>

                <button
                  className={`submenu-item ${isActive("/work-permits/feetiers") ? "active" : ""
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
                  Documents Requirement
                </button>

                <button
                  className={`submenu-item ${isActive("/work-permits/informations") ? "active" : ""
                    }`}
                  onClick={() => navigate("/work-permits/informations")}
                >
                  WorkPermit Information
                </button>

                {/* <button
                className={`submenu-item ${isActive("/work-permits/pricing") ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits/status-history")}
              >
                Status History
              </button> */}
              </div>
            )}
          </div>
        )}

        {/* VISA SERVICE */}
        {canViewServices && (
          <div className="sidebar-dropdown">
            <button
              className={`menu-item ${isVisaActive() ? "active" : ""
                }`}
              onClick={() => setVisaOpen(!visaOpen)}
            >
              <span className="menu-icon"><FaPassport /></span>
              <span className="menu-label">Visa Service</span>

              <span
                className={`dropdown-arrow ${visaOpen ? "open" : ""
                  }`}
              >
                ▼
              </span>
            </button>

            {visaOpen && (
              <div className="submenu">
                {canViewBooking && (
                  <button
                    className={`submenu-item ${location.pathname === "/visa-applications" ? "active" : ""
                      }`}
                    onClick={() => navigate("/visa-applications")}
                  >
                    All Visa Appliaction
                  </button>
                )}

                <button
                  className={`submenu-item ${isActive("/visa/category") ? "active" : ""
                    }`}
                  onClick={() => navigate("/visa/category")}
                >
                  Visa Category
                </button>

                <button
                  className={`submenu-item ${isActive("/visa/pricing-tiers") ? "active" : ""
                    }`}
                  onClick={() => navigate("/visa/pricing-tiers")}
                >
                  Fee Tiers
                </button>

                <button
                  className={`submenu-item ${isActive("/visa/documents") ? "active" : ""
                    }`}
                  onClick={() => navigate("/visa/documents")}
                >
                  Documents Requirement
                </button>

                <button
                  className={`submenu-item ${isActive("/visa/informations") ? "active" : ""
                    }`}
                  onClick={() => navigate("/visa/informations")}
                >
                  Visa Information
                </button>

                {/* <button
                className={`submenu-item ${isActive("/work-permits/pricing") ? "active" : ""
                  }`}
                onClick={() => navigate("/work-permits/status-history")}
              >
                Status History
              </button> */}
              </div>
            )}
          </div>
        )}

        {/* INSURANCE */}
        {canViewServices && (
          <div className="sidebar-dropdown">
            <button
              className={`menu-item ${isInsuranceActive() ? "active" : ""
                }`}
              onClick={() => setInsuranceOpen(!insuranceOpen)}
            >
              <span className="menu-icon"><FaShieldAlt /></span>
              <span className="menu-label">Insurance Service</span>

              <span
                className={`dropdown-arrow ${insuranceOpen ? "open" : ""
                  }`}
              >
                ▼
              </span>
            </button>

            {insuranceOpen && (
              <div className="submenu">
                {canViewBooking && (
                  <button
                    className={`submenu-item ${location.pathname === "/insurance-applications" ? "active" : ""
                      }`}
                    onClick={() => navigate("/insurance-applications")}
                  >
                    All Insurance Appliaction
                  </button>
                )}

                <button
                  className={`submenu-item ${isActive("/insurance/plan") ? "active" : ""
                    }`}
                  onClick={() => navigate("/insurance/plan")}
                >
                  Insurance Plan
                </button>

                <button
                  className={`submenu-item ${isActive("/insurance/pricing-tiers") ? "active" : ""
                    }`}
                  onClick={() => navigate("/insurance/pricing-tiers")}
                >
                  Fee Tiers
                </button>

                <button
                  className={`submenu-item ${isActive("/insurance/documents") ? "active" : ""
                    }`}
                  onClick={() => navigate("/insurance/documents")}
                >
                  Documents Requirement
                </button>

                <button
                  className={`submenu-item ${isActive("/insurance/informations") ? "active" : ""
                    }`}
                  onClick={() => navigate("/insurance/informations")}
                >
                  Insurance Information
                </button>

                <button
                  className={`submenu-item ${isActive("/insurance/dynamic-fields") ? "active" : ""
                    }`}
                  onClick={() => navigate("/insurance/dynamic-fields")}
                >
                  Dynamic Field
                </button>
              </div>
            )}
          </div>
        )}


        {/* HOTEL SERVICE */}
        {canViewServices && (
          <div className="sidebar-dropdown">
            <button
              className={`menu-item ${isHotelActive() ? "active" : ""}`}
              onClick={() => setHotelOpen(!hotelOpen)}
            >
              <span className="menu-icon"><FaHotel /></span>
              <span className="menu-label">Hotel Service</span>
              <span className={`dropdown-arrow ${hotelOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>

            {hotelOpen && (
              <div className="submenu">
                {canViewBooking && (
                  <button
                    className={`submenu-item ${location.pathname === "/hotel-bookings" ? "active" : ""}`}
                    onClick={() => navigate("/hotel-bookings")}
                  >
                    All Hotel Bookings
                  </button>
                )}

                <button
                  className={`submenu-item ${location.pathname === "/hotels" ? "active" : ""}`}
                  onClick={() => navigate("/hotels")}
                >
                  Hotels
                </button>

                <button
                  className={`submenu-item ${isActive("/hotel/pricing-tiers") ? "active" : ""}`}
                  onClick={() => navigate("/hotel/pricing-tiers")}
                >
                  Pricing Tiers
                </button>

                <button
                  className={`submenu-item ${isActive("/hotel/informations") ? "active" : ""}`}
                  onClick={() => navigate("/hotel/informations")}
                >
                  Hotel Information
                </button>

                <button
                  className={`submenu-item ${isActive("/hotel/policies") ? "active" : ""}`}
                  onClick={() => navigate("/hotel/policies")}
                >
                  Policies
                </button>

                <button
                  className={`submenu-item ${isActive("/hotel/testimonials") ? "active" : ""}`}
                  onClick={() => navigate("/hotel/testimonials")}
                >
                  Testimonials
                </button>

                <button
                  className={`submenu-item ${isActive("/hotel/faqs") ? "active" : ""}`}
                  onClick={() => navigate("/hotel/faqs")}
                >
                  FAQs
                </button>
              </div>
            )}
          </div>
        )}

        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/documents") ? "active" : ""
              }`}
            onClick={() => navigate("/documents")}
          >
            <span className="menu-icon"><FaFileAlt /></span>
            <span>Documents</span>
          </button>
        )}


        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/travel-guide") ? "active" : ""
              }`}
            onClick={() => navigate("/travel-guide")}
          >
            <span className="menu-icon"><FaBookOpen /></span>
            <span>Travel Guide</span>
          </button>
        )}


        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/page-manager") ? "active" : ""
              }`}
            onClick={() => navigate("/page-manager")}
          >
            <span className="menu-icon"><FaImages /></span>
            <span>Page Manager</span>
          </button>
        )}

        {canViewCMS && (
          <button
            className={`menu-item ${isActive("/gallery-manager") ? "active" : ""
              }`}
            onClick={() => navigate("/gallery-manager")}
          >
            <span className="menu-icon"><FaImages /></span>
            <span>Gallery Manager</span>
          </button>
        )}


        {isAdmin && (
          <button
            className={`menu-item ${isActive("/users") ? "active" : ""
              }`}
            onClick={() => navigate("/users")}
          >
            <span className="menu-icon"><FaUsers /></span>
            <span>Users</span>
          </button>
        )}

        {isAdmin && (
          <button
            className={`menu-item ${isActive("/roles") ? "active" : ""
              }`}
            onClick={() => navigate("/roles")}
          >
            <span className="menu-icon"><FaUserShield /></span>
            <span>Roles</span>
          </button>
        )}


        {/* {isAdmin && (
        <button
            className={`menu-item ${isActive("/permissions") ? "active" : ""}`}
            onClick={() => navigate("/permissions")}
          >
            <span className="menu-icon">
              <FaShieldAlt />
            </span>
            <span>Permissions</span>
          </button>
        )} */}


      </nav>

      <div className="sidebar-bottom">
        {isAdmin && (
          <button
            className={`menu-item ${isActive("/settings") ? "active" : ""
              }`}
            onClick={() => navigate("/settings")}
          >
            <span className="menu-icon"><FaCog /></span>
            <span>Settings</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;