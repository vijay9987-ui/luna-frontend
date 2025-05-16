import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrderPages, setTotalOrderPages] = useState(1);
  const ordersPerPage = 5;

  const fetchStats = async () => {
    try {
      const [userRes, productRes] = await Promise.all([
        axios.get('https://luna-backend-1.onrender.com/api/users/users'),
        axios.get('https://luna-backend-1.onrender.com/api/products/getproducts'),
      ]);

      const users = userRes.data;
      const products = productRes.data;

      setStats(prev => ({
        ...prev,
        users: users.length,
        products: products.length,
      }));
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  const fetchOrders = async (page) => {
    try {
      const orderRes = await axios.get(
        `https://luna-backend-1.onrender.com/api/users/allorders?limit=${ordersPerPage}&page=${page}`
      );

      const ordersData = orderRes.data;

      const totalRevenue = ordersData.orders.reduce((acc, order) => acc + order.totalAmount, 0);

      setStats(prev => ({
        ...prev,
        orders: ordersData.totalOrders || 0,
        revenue: totalRevenue || 0,
      }));

      const orders = ordersData.orders.map(order => ({
        _id: order.orderId,
        customerName: order.shippingAddress.fullName,
        createdAt: order.createdAt,
        status: order.orderStatus,
        total: order.totalAmount,
      }));

      setRecentOrders(orders);
      setTotalOrderPages(Math.ceil((ordersData.totalOrders || 1) / ordersPerPage));

      // Pie Chart Data
      const statusCount = {};
      orders.forEach(order => {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
      });

      const statusChartData = Object.keys(statusCount).map(key => ({
        name: key,
        value: statusCount[key],
      }));

      setOrderStatusData(statusChartData);

    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const formattedStats = [
    { title: 'Total Users', value: stats.users, change: '+12%', variant: 'primary' },
    { title: 'Total Products', value: stats.products, change: '+5%', variant: 'success' },
    { title: 'Total Orders', value: stats.orders, change: '+23%', variant: 'info' },
    { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, change: '+18%', variant: 'warning' },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];
  const getColor = (index) => COLORS[index % COLORS.length];

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalOrderPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <h1 className="h3 mb-4">Dashboard Overview</h1>

      <div className="row mb-4">
        {formattedStats.map((stat, index) => (
          <div key={index} className="col-md-3 mb-3">
            <div className={`card bg-${stat.variant} text-white`}>
              <div className="card-body">
                <h5 className="card-title">{stat.title}</h5>
                <h2 className="card-text">{stat.value}</h2>
                <p className="card-text">
                  <small>{stat.change} from last month</small>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mb-4">
        <div className="col-md-8 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Revenue Overview</h5>
              <div className="bg-light p-4 text-center">
                <img src="#" className="img-fluid" alt="Revenue Chart Placeholder" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Order Status</h5>
              <div className="bg-light p-4 text-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(index)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Recent Orders</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col"># Order ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="text-nowrap text-muted">{order._id}</td>
                      <td className="fw-semibold">{order.customerName}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge 
                    ${order.status === 'Pending' ? 'bg-warning text-dark' :
                            order.status === 'Shipped' ? 'bg-info text-white' :
                              order.status === 'Delivered' ? 'bg-success' :
                                order.status === 'Cancelled' ? 'bg-danger' :
                                  'bg-secondary'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="fw-bold">${order.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-outline-secondary"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalOrderPages}</span>
        <button
          className="btn btn-outline-secondary"
          disabled={currentPage === totalOrderPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>

    </div>

  );
};

export default AdminDashboard;
