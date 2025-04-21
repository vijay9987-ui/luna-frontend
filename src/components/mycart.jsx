import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../views/Navbar';
import Footer from '../views/Footer';

const MyCart = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [error, setError] = useState(null);

    const [address, setAddress] = useState({
        name: "",
        mobile: "",
        email: "",
        addressline1: "",
        addressline2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        type: "Home"
    });

    const [cartData, setCartData] = useState({
        cartItems: [],
        totalItems: 0,
        subTotal: 0,
        deliveryCharge: 0,
        finalAmount: 0,
        loading: true,
        error: null
    });

    // Get user ID from session storage
    const getUserId = () => {
        const savedUser = JSON.parse(sessionStorage.getItem("user")) || {};
        return savedUser.userId;
    };

    // Fetch cart data
    const fetchCart = useCallback(async () => {
        try {
            const userId = getUserId();
            if (!userId) return;

            setCartData(prev => ({ ...prev, loading: true, error: null }));
            const response = await axios.get(`https://luna-backend-1.onrender.com/api/users/getcart/${userId}`);

            setCartData({
                cartItems: response.data.cartItems || [],
                totalItems: response.data.totalItems || 0,
                subTotal: response.data.subTotal || 0,
                deliveryCharge: response.data.deliveryCharge || 0,
                finalAmount: response.data.finalAmount || 0,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to load cart"
            }));
        }
    }, []);

    // Fetch addresses from backend
    const fetchAddresses = useCallback(async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`https://luna-backend-1.onrender.com/api/users/getaddress/${userId}`);
            setAddresses(response.data.addresses || []);
        } catch (err) {
            console.error("Error fetching addresses:", err);
            setError(err.response?.data?.message || "Failed to load addresses");
        }
    }, []);

    // Initial data loading
    useEffect(() => {
        fetchCart();
        fetchAddresses();
    }, [fetchCart, fetchAddresses]);

    // Handle quantity change
    const updateQuantity = async (productId, action) => {
        try {
            const userId = getUserId();
            if (!userId) return;

            setCartData(prev => ({ ...prev, loading: true }));
            await axios.post(
                `https://luna-backend-1.onrender.com/api/users/addtocart/${userId}`,
                { productId, action }
            );
            await fetchCart(); // Refresh cart data
        } catch (error) {
            console.error("Error updating quantity:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to update quantity"
            }));
        }
    };

    // Handle item removal
    const removeItem = async (productId) => {
        try {
            const userId = getUserId();
            if (!userId) return;

            setCartData(prev => ({ ...prev, loading: true }));
            await axios.delete(
                `https://luna-backend-1.onrender.com/api/users/removefromcart/${userId}/${productId}`
            );
            await fetchCart(); // Refresh cart data
        } catch (error) {
            console.error("Error removing item:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to remove item"
            }));
        }
    };

    const handleCheckout = async () => {
        if (cartData.cartItems.length === 0) {
            setError("Your cart is empty");
            return;
        }

        if (!selectedAddress) {
            setError("Please select a delivery address");
            return;
        }

        try {
            const userId = getUserId();
            if (!userId) return;

            const orderData = {
                userId,
                items: cartData.cartItems.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    price: item.product.price
                })),
                shippingAddress: selectedAddress,
                totalAmount: cartData.finalAmount
            };

            const response = await axios.post(`https://luna-backend-1.onrender.com/api/orders/create/${userId}`, orderData);

            // Clear cart after successful checkout
            await axios.delete(`https://luna-backend-1.onrender.com/api/users/clearcart/${userId}`);
            await fetchCart();

            // Redirect to order confirmation or show success message
            navigate(`/order-confirmation/${response.data.orderId}`);

        } catch (err) {
            console.error("Checkout failed:", err);
            setError(err.response?.data?.message || "Checkout failed");
        }
    };

    // Handle address form changes
    const handleChangeAdd = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    // Save new address
    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const userId = getUserId();
        if (!userId) return;

        try {
            await axios.post(`https://luna-backend-1.onrender.com/api/users/create-address/${userId}`, address);
            await fetchAddresses();
            setShowAddressForm(false);
            setAddress({
                name: "", mobile: "", email: "", addressline1: "", addressline2: "",
                city: "", state: "", country: "", pincode: "", type: "Home"
            });
        } catch (err) {
            console.error("Failed to save address:", err);
            setError(err.response?.data?.message || "Failed to save address");
        }
    };

    // Delete address
    const handleDeleteAddress = async (addressId) => {
        const userId = getUserId();
        if (!userId) return;

        try {
            await axios.delete(`https://luna-backend-1.onrender.com/api/users/remove-address/${userId}/${addressId}`);
            await fetchAddresses();
            if (selectedAddress?._id === addressId) {
                setSelectedAddress(null);
            }
        } catch (err) {
            console.error("Failed to delete address:", err);
            setError(err.response?.data?.message || "Failed to delete address");
        }
    };

    // Select address for order
    const handleSelectAddress = (addr) => {
        setSelectedAddress(addr);
    };

    return (
        <>
            <Navbar />
            <div className="container my-5">
                <h2 className="mb-4">My Cart ({cartData.totalItems} items)</h2>

                {cartData.error && (
                    <div className="alert alert-danger">{cartData.error}</div>
                )}
                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {cartData.cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h4>Your cart is empty</h4>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/dashboard')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card mb-4 border-dark">
                                    <div className="card-body table-responsive">
                                        <table className="table table-bordered align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Image</th>
                                                    <th>Product</th>
                                                    <th>Quantity</th>
                                                    <th>Total</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cartData.cartItems.map((item) => (
                                                    <tr key={item.product._id}>
                                                        {/* Product Image */}
                                                        <td>
                                                            <img
                                                                src={item.product.images?.[0] || "/fallback.png"}
                                                                alt={item.product.name}
                                                                className="img-fluid rounded border"
                                                                style={{ maxHeight: "80px" }}
                                                            />
                                                        </td>

                                                        {/* Product Details */}
                                                        <td className="text-start">
                                                            <h6 className="text-dark mb-1">{item.product.name}</h6>
                                                            <small className="text-secondary">
                                                                {item.color && `Color: ${item.color}`}
                                                                {item.size && ` | Size: ${item.size}`}
                                                            </small>
                                                            <div className="fw-bold mt-1">
                                                                ₹{item.product.price.toFixed(2)}
                                                            </div>
                                                        </td>

                                                        {/* Quantity Controls */}
                                                        <td>
                                                            <div className="d-flex justify-content-center align-items-center">
                                                                <button
                                                                    className="btn btn-outline-dark btn-sm border-dark"
                                                                    onClick={() => updateQuantity(item.product._id, "decrement")}
                                                                    disabled={cartData.loading}
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="mx-3">{item.quantity}</span>
                                                                <button
                                                                    className="btn btn-outline-dark btn-sm border-dark"
                                                                    onClick={() => updateQuantity(item.product._id, "increment")}
                                                                    disabled={cartData.loading}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Subtotal */}
                                                        <td className="fw-semibold text-dark">
                                                            ₹{(item.product.price * item.quantity).toFixed(2)}
                                                        </td>

                                                        {/* Remove Button */}
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger border-danger"
                                                                onClick={() => removeItem(item.product._id)}
                                                                disabled={cartData.loading}
                                                                title="Remove Item"
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className='container'>
                            <div className='row'>
                                <div className="col-sm-6 border border-0">
                                    <div className="card">
                                        <div className="card-header bg-dark text-white">
                                            <h5 className="mb-0">Delivery Address</h5>
                                        </div>
                                        <div className="card-body">
                                            {addresses.length > 0 ? (
                                                <>
                                                    {addresses.map((addr) => (
                                                        <div
                                                            key={addr._id}
                                                            className={`mb-3 p-3 border rounded ${selectedAddress?._id === addr._id ? "border-primary bg-light" : ""}`}
                                                            onClick={() => handleSelectAddress(addr)}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <div className="form-check">
                                                                <input
                                                                    type="radio"
                                                                    className="form-check-input"
                                                                    checked={selectedAddress?._id === addr._id}
                                                                    onChange={() => { }}
                                                                />
                                                                <label className="form-check-label">
                                                                    <strong>{addr.name}</strong> ({addr.type})
                                                                </label>
                                                            </div>
                                                            <p className="mb-1">{addr.addressline1}, {addr.addressline2}</p>
                                                            <p className="mb-1">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                            <p className="mb-1">{addr.country}</p>
                                                            <p className="mb-0">Phone: {addr.mobile}</p>
                                                            <p className="mb-0">Email: {addr.email}</p>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger mt-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm("Are you sure you want to delete this address?")) {
                                                                        handleDeleteAddress(addr._id);
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        className="btn btn-outline-dark w-100"
                                                        onClick={() => setShowAddressForm(true)}
                                                    >
                                                        + Add New Address
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-center">
                                                    <p>No saved addresses</p>
                                                    <button
                                                        className="btn btn-dark"
                                                        onClick={() => setShowAddressForm(true)}
                                                    >
                                                        Add Address
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                            
                                <div className="col-sm-6 border border-0">
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">Order Summary</h5>
                                            <hr />
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal ({cartData.totalItems} items)</span>
                                                <span>₹{cartData.subTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Delivery Charge</span>
                                                <span>₹{cartData.deliveryCharge.toFixed(2)}</span>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between fw-bold mb-4">
                                                <span>Total Amount</span>
                                                <span>₹{cartData.finalAmount.toFixed(2)}</span>
                                            </div>
                                            <button
                                                className="btn btn-outline-dark w-100"
                                                onClick={handleCheckout}
                                                disabled={cartData.loading}
                                            >
                                                {cartData.loading ? 'Processing...' : 'Proceed to Checkout'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Form Modal */}
                        {showAddressForm && (
                            <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
                                <div className="modal-dialog modal-lg">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title text-dark">Add New Address</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setShowAddressForm(false)}
                                            ></button>
                                        </div>
                                        <div className="modal-body">
                                            <form className="row g-3 mt-4 text-dark" onSubmit={handleSaveAddress}>
                                                <div className="col-md-6">
                                                    <label className="form-label">Name*</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className="form-control"
                                                        value={address.name}
                                                        onChange={handleChangeAdd}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Mobile*</label>
                                                    <input
                                                        type="tel"
                                                        name="mobile"
                                                        className="form-control"
                                                        value={address.mobile}
                                                        onChange={handleChangeAdd}
                                                        required
                                                        pattern="[0-9]{10}"
                                                    />
                                                </div>
                                                <div className="col-md-12">
                                                    <label className="form-label">Email*</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="form-control"
                                                        value={address.email}
                                                        onChange={handleChangeAdd}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Address Line 1*</label>
                                                    <input
                                                        type="text"
                                                        name="addressline1"
                                                        className="form-control"
                                                        value={address.addressline1}
                                                        onChange={handleChangeAdd}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-12">
                                                    <label className="form-label">Address Line 2</label>
                                                    <input
                                                        type="text"
                                                        name="addressline2"
                                                        className="form-control"
                                                        value={address.addressline2}
                                                        onChange={handleChangeAdd}
                                                    />
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="form-label">City*</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        className="form-control"
                                                        value={address.city}
                                                        onChange={handleChangeAdd}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">State*</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        className="form-control"
                                                        value={address.state}
                                                        onChange={handleChangeAdd}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">Country*</label>
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        className="form-control"
                                                        value={address.country}
                                                        onChange={handleChangeAdd}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Pincode*</label>
                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        className="form-control"
                                                        value={address.pincode}
                                                        onChange={handleChangeAdd}
                                                        required
                                                        pattern="[0-9]{6}"
                                                    />
                                                </div>

                                                <div className="col-12">
                                                    <label className="form-label me-2">Address Type:</label>
                                                    {["Home", "Office", "Other"].map((type) => (
                                                        <div key={type} className="form-check form-check-inline">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="type"
                                                                value={type}
                                                                checked={address.type === type}
                                                                onChange={handleChangeAdd}
                                                                id={`type-${type}`}
                                                            />
                                                            <label className="form-check-label" htmlFor={`type-${type}`}>
                                                                {type}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="col-12 text-center mt-3">
                                                    <button type="submit" className="btn btn-success me-2">
                                                        Save Address
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => setShowAddressForm(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div >
            <Footer />
        </>
    );
};

export default MyCart;