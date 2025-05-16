import { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const ordersPerPage = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/users/allorders?page=${currentPage}&limit=${ordersPerPage}`);
                setOrders(res.data.orders);
                setTotalOrders(res.data.total);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [currentPage]);

    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        const matchesStatus = statusFilter ? order.orderStatus === statusFilter : true;
        const matchesDate = dateFilter ? orderDate === dateFilter : true;
        return matchesStatus && matchesDate;
    });

    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    return (
        <div className="container py-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                <h2 className="mb-0 text-primary">Order Management</h2>
                <div className="d-flex flex-column flex-md-row gap-3">
                    <select className="form-select" style={{ minWidth: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Filter by Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancel request">Cancel request</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <input
                        type="date"
                        className="form-control"
                        style={{ minWidth: '180px' }}
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <h6 className="m-0 font-weight-bold">Orders List</h6>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr key={order.orderId}>
                                                <td>{order.orderId}</td>
                                                <td>{order.shippingAddress?.fullName || 'N/A'}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge text-bg-${order.orderStatus === 'Shipped' ? 'success'
                                                        : order.orderStatus === 'Pending' ? 'warning'
                                                            : order.orderStatus === 'Delivered' ? 'primary'
                                                                : order.orderStatus === 'Cancelled' ? 'danger'
                                                                    : 'secondary'}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td>${order.totalAmount.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() => {
                                                            setCurrentOrder(order);
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-secondary">
                                                        Invoice
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">No orders found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="d-flex justify-content-between align-items-center p-3 border-top">
                            <span className="text-muted">Page {currentPage} of {totalPages}</span>
                            <div>
                                <button
                                    className="btn btn-sm btn-outline-secondary me-2"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {showModal && currentOrder && (
                <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Order Details - {currentOrder.orderId}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold">Customer Info</h6>
                                        <p className="mb-2">
                                            {currentOrder.shippingAddress?.fullName}<br />
                                            {currentOrder.shippingAddress?.addressLine}, {currentOrder.shippingAddress?.city}<br />
                                            {currentOrder.shippingAddress?.state}, {currentOrder.shippingAddress?.zipCode}<br />
                                            {currentOrder.shippingAddress?.country}<br />
                                            <strong>Phone:</strong> {currentOrder.shippingAddress?.phone}
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold">Order Info</h6>
                                        <p className="mb-2">
                                            <strong>Date:</strong> {new Date(currentOrder.createdAt).toLocaleDateString()}<br />
                                            <strong>Status:</strong> {currentOrder.orderStatus}<br />
                                            <strong>Payment:</strong> {currentOrder.paymentStatus}
                                        </p>
                                    </div>
                                </div>

                                <h6 className="fw-bold">Order Items</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Product</th>
                                                <th>Size</th>
                                                <th>Color</th>
                                                <th>Price</th>
                                                <th>Qty</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentOrder.products.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.productId?.name || 'N/A'}</td>
                                                    <td>{item.size || '—'}</td>
                                                    <td>{item.color || '—'}</td>
                                                    <td>${item.price.toFixed(2)}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="5" className="text-end">Subtotal</td>
                                                <td>
                                                    ${currentOrder.products
                                                        .reduce((sum, p) => sum + p.price * p.quantity, 0)
                                                        .toFixed(2)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="5" className="text-end">Shipping</td>
                                                <td>${currentOrder.deliveryCharge.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="5" className="text-end fw-bold">Total</td>
                                                <td className="fw-bold">${currentOrder.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary">Update Status</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
