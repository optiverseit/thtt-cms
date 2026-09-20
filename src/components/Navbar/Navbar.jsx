import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const name = localStorage.getItem("name") || "Admin";
  const email = localStorage.getItem("email") || "";
  const avatar = localStorage.getItem("avatar");

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Logout?",
      text: "Are you sure you want to logout?",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f52d91",
      cancelButtonColor: "#77717d",
    });

    if (result.isConfirmed) {
      localStorage.clear();

      await Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been logged out successfully.",
        timer: 1300,
        showConfirmButton: false,
      });

      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <header className="dashboard-navbar">
      <div className="navbar-title">
        <h3>Trip Himalaya CMS</h3>
      </div>

      <div className="navbar-profile">
        <button
          type="button"
          className="profile-button"
          onClick={() =>
            setProfileOpen((prev) => !prev)
          }
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-placeholder">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </button>

        {profileOpen && (
          <div className="profile-dropdown">

            <div className="profile-dropdown-header">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                />
              ) : (
                <div className="dropdown-placeholder">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="profile-info">
                <strong>{name}</strong>
                <span>{email}</span>
              </div>
            </div>

            <div className="dropdown-divider" />

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                navigate("/profile");
              }}
            >
              <span>●</span>
              Profile
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                navigate("/settings");
              }}
            >
              <span>⚙</span>
              Settings
            </button>

            <div className="dropdown-divider" />

            <button
              type="button"
              className="logout-option"
              onClick={handleLogout}
            >
              <span>↪</span>
              Logout
            </button>

          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;