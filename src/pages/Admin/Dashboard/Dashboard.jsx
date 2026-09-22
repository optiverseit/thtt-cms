import "./Dashboard.css";

import Sidebar from "../../../components/Sidebar/Sidebar";
import Navbar from "../../../components/Navbar/Navbar";

const Dashboard = () => {
  const name = localStorage.getItem("name") || "Admin";

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar />

        {/* DASHBOARD CONTENT */}
        <main className="dashboard-content">

          <div className="dashboard-heading">
            <div>
              <h1>Welcome back, {name}</h1>

              <p>
                Here's what's happening with Trip Himalaya today.
              </p>
            </div>
          </div>

          <div className="stat-grid">

            <div className="stat-card">
              <div className="stat-icon">◆</div>

              <div>
                <span>Total Packages</span>
                <h2>0</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">▣</div>

              <div>
                <span>Total Bookings</span>
                <h2>0</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">♙</div>

              <div>
                <span>Total Users</span>
                <h2>0</h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">◫</div>

              <div>
                <span>Categories</span>
                <h2>0</h2>
              </div>
            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <h2>Recent Bookings</h2>

                <p>
                  Latest bookings made through Trip Himalaya.
                </p>
              </div>

              <button>View All</button>
            </div>

            <div className="empty-state">
              <span>▣</span>

              <h3>No bookings yet</h3>

              <p>
                Recent bookings will appear here.
              </p>
            </div>

          </div>

        </main>

      </div>
    </div>
  );
};

export default Dashboard;