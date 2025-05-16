import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const NavItem = ({ to, text, icon, sidebarOpen }) => (
    <Link
      to={to}
      className="d-flex align-items-center px-3 py-2 text-white text-decoration-none sidebar-link"
    >
      <i className={`me-2 ${icon}`}></i>
      {sidebarOpen && <span>{text}</span>}
    </Link>
  );

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-md-row vh-100 bg-light">
      {/* Sidebar */}
      <div className={`bg-dark text-white ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'} d-md-block`} style={{ transition: 'width 0.3s' }}>
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          {sidebarOpen && <h1 className="h5 mb-0">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-sm btn-outline-light">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="mt-3">
          <NavItem to="/admin/dashboard" text="Dashboard" icon="fas fa-tachometer-alt" sidebarOpen={sidebarOpen} />
          <NavItem to="/admin/users" text="Users" icon="fas fa-users" sidebarOpen={sidebarOpen} />
          <NavItem to="/admin/products" text="Products" icon="fas fa-box-open" sidebarOpen={sidebarOpen} />
          <NavItem to="/admin/orders" text="Orders" icon="fas fa-shopping-cart" sidebarOpen={sidebarOpen} />
          <NavItem to="/admin/revenue" text="Revenue" icon="fas fa-chart-line" sidebarOpen={sidebarOpen} />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 overflow-auto">
        <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center border-bottom">
          <h2 className="h5 mb-0">Admin Panel</h2>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light position-relative">
              <i className="fas fa-bell me-1"></i> Notifications
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
            </button>
            <div className="dropdown">
              <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Admin User
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item" onClick={() => setShowProfileModal(true)}>Profile</button></li>
                <li><button className="dropdown-item" onClick={() => setShowSettingsModal(true)}>Settings</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item">Logout</button></li>
              </ul>
            </div>
          </div>
        </header>

        <main className="p-4">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </div>
  );
};

export default AdminLayout;
