import { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    mobileNumber: '',
    profile: {
      firstName: '',
      lastName: '',
      gender: 'Male',
      email: ''
    },
    isAdmin: false,
    status: 'Active'
  });

  // Fetch all users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://luna-backend-1.onrender.com/api/users/users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('profile.')) {
      const profileField = name.split('.')[1];
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'isAdmin' ? value === 'Admin' : value
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error

    try {
      let userId;

      if (currentUser) {
        userId = currentUser._id;

        // 🟡 Update base user fields (username, mobileNumber)
        await axios.put(`https://luna-backend-1.onrender.com/api/users/setuser/${userId}`, {
          username: formData.username,
          mobileNumber: formData.mobileNumber
        });

        // 🟡 Update full profile
        await axios.post(`https://luna-backend-1.onrender.com/api/users/user/createprofiledata/${userId}`, {
          firstName: formData.profile.firstName,
          lastName: formData.profile.lastName,
          gender: formData.profile.gender,
          email: formData.profile.email,
          mobile: formData.mobileNumber
        });

      } else {
        // 🟢 Login or Register (creates new user if needed)
        const loginRes = await axios.post('https://luna-backend-1.onrender.com/api/users/login', {
          username: formData.username,
          mobileNumber: formData.mobileNumber
        });

        userId = loginRes.data.user._id;

        // 🟢 Create new profile
        await axios.post(`https://luna-backend-1.onrender.com/api/users/user/createprofiledata/${userId}`, {
          firstName: formData.profile.firstName,
          lastName: formData.profile.lastName,
          gender: formData.profile.gender,
          email: formData.profile.email,
          mobile: formData.mobileNumber
        });
      }

      // 🔁 Refresh user list
      const { data } = await axios.get(`https://luna-backend-1.onrender.com/api/users/users`);
      setUsers(data);

      setShowModal(false); // Close modal
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Something went wrong");
    }
  };



  // Delete user
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`https://luna-backend-1.onrender.com/api/users/delete/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  // Open modal for editing
  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      mobileNumber: user.mobileNumber,
      profile: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        gender: user.profile?.gender || 'Male',
        email: user.profile?.email || ''
      },
      isAdmin: user.isAdmin || false,
      status: user.status || 'Active'
    });
    setShowModal(true);
  };

  // Reset form when opening for new user
  const openNewModal = () => {
    setCurrentUser(null);
    setFormData({
      username: '',
      mobileNumber: '',
      profile: {
        firstName: '',
        lastName: '',
        gender: 'Male',
        email: ''
      },
      isAdmin: false,
      status: 'Active'
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-primary">User Management</h1>
        <button
          onClick={openNewModal}
          className="btn btn-primary"
        >
          <i className="fas fa-plus me-2"></i>Add New User
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h6 className="m-0 font-weight-bold">Users List</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Username</th>
                  <th>Full Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="ps-4">{user.username}</td>
                      <td>{user.profile?.firstName} {user.profile?.lastName}</td>
                      <td>{user.mobileNumber}</td>
                      <td>{user.profile?.email || '-'}</td>
                      <td>
                        <span className={`badge rounded-pill ${user.isAdmin ? 'bg-info' : 'bg-secondary'}`}>
                          {user.isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${user.status === 'Active' ? 'bg-success' :
                            user.status === 'Inactive' ? 'bg-warning text-dark' : 'bg-danger'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="pe-4">
                        <div className="d-flex">
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{currentUser ? 'Edit User' : 'Add New User'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Username*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number*</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">First Name*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="profile.firstName"
                        value={formData.profile.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="profile.lastName"
                        value={formData.profile.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="profile.email"
                        value={formData.profile.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="profile.gender"
                        value={formData.profile.gender}
                        onChange={handleInputChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        name="isAdmin"
                        value={formData.isAdmin ? 'Admin' : 'Customer'}
                        onChange={handleInputChange}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Customer">Customer</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {currentUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;