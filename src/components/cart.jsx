import { useState, useEffect, useCallback } from "react";
import Navbar from "../views/Navbar";
import Footer from "../views/Footer";
import axios from "axios";

const MyCart = () => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

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

    // Memoized function to get user ID
    const getUserId = useCallback(() => {
        try {
            const savedUser = JSON.parse(sessionStorage.getItem("user")) || {};
            return savedUser.userId;
        } catch (err) {
            console.error("Error parsing user data:", err);
            return null;
        }
    }, []);

    // Fetch cart data from backend
    const fetchCart = useCallback(async () => {
        const userId = getUserId();
        if (!userId) {
            setError("User not logged in");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`https://luna-backend-1.onrender.com/api/users/getcart/${userId}`);
            setCart(response.data.cartItems || []);
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            setError(err.response?.data?.message || "Failed to load cart");
        } finally {
            setLoading(false);
        }
    }, [getUserId]);

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
    }, [getUserId]);

    // Toggle selection for individual product
    const toggleProductSelection = (productId) => {
        setSelectedProducts(prev => {
            const newSelection = prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId];

            // Update selectAll state based on new selection
            setSelectAll(newSelection.length === cart.length);

            return newSelection;
        });
    };

    // Toggle select all products
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(cart.map(item => item.product._id));
        }
        setSelectAll(!selectAll);
    };

    // Handle quantity changes
    const handleQuantityChange = async (productId, newQuantity, size, color) => {
        if (newQuantity < 1) return;

        const userId = getUserId();
        if (!userId) return;

        try {
            const action = newQuantity > cart.find(item =>
                item.product._id === productId &&
                item.size === size &&
                item.color === color
            )?.quantity ? "increment" : "decrement";

            await axios.post(`https://luna-backend-1.onrender.com/api/users/addtocart/${userId}`, {
                productId,
                action,
                size,
                color
            });

            await fetchCart();
        } catch (err) {
            console.error("Failed to update quantity:", err);
            setError(err.response?.data?.message || "Failed to update quantity");
        }
    };

    // Remove single product from cart
    const handleRemoveFromCart = async (productId, size, color) => {
        try {
            setLoading(true);
            const response = await axios.delete(`https://luna-backend-1.onrender.com/api/users/removefromcart/${userId}/${productId}`, {
                data: { size, color } // Send size and color in request body
            });
            
            if (response.data.success) {
                // Update local state to remove the item
                setCart(prevCart => 
                    prevCart.filter(item => 
                        !(item.product._id === productId && 
                          (size ? item.size === size : true) && 
                          (color ? item.color === color : true))
                    )
                );
                
                // Remove from selected products if it was selected
                setSelectedProducts(prev => prev.filter(id => id !== productId));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove item');
        } finally {
            setLoading(false);
        }
    };

    // Remove multiple selected products
    const handleRemoveSelected = async () => {
        if (selectedProducts.length === 0) return;
        
        try {
            setLoading(true);
            // Create an array of promises for all delete operations
            const deletePromises = selectedProducts.map(productId => 
                axios.delete(`https://luna-backend-1.onrender.com/api/users/removefromcart/${userId}/${productId}`)
            );
            
            // Wait for all delete operations to complete
            await Promise.all(deletePromises);
            
            // Update local state
            setCart(prevCart => 
                prevCart.filter(item => !selectedProducts.includes(item.product._id))
            );
            
            // Clear selected products
            setSelectedProducts([]);
            setSelectAll(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove selected items');
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals for selected products
    const calculateSelectedTotals = useCallback(() => {
        const selectedItems = cart.filter(item => selectedProducts.includes(item.product._id));

        const subtotal = selectedItems.reduce(
            (sum, item) => sum + (item.product.price * item.quantity),
            0
        );
        const deliveryCharge = subtotal > 500 ? 0 : 50;
        const tax = subtotal * 0.05;
        const grandTotal = subtotal + tax + deliveryCharge;

        return {
            subtotal,
            tax,
            deliveryCharge,
            grandTotal,
            selectedCount: selectedItems.length
        };
    }, [cart, selectedProducts]);

    // Checkout selected products
    const handleCheckout = async () => {
        if (selectedProducts.length === 0) {
            setError("Please select at least one product to checkout");
            return;
        }

        if (!selectedAddress) {
            setError("Please select a delivery address");
            return;
        }

        try {
            const userId = getUserId();
            if (!userId) return;

            const selectedItems = cart.filter(item => selectedProducts.includes(item.product._id));
            const orderData = {
                userId,
                items: selectedItems.map(item => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    price: item.product.price
                })),
                shippingAddress: selectedAddress,
                totalAmount: calculateSelectedTotals().grandTotal
            };

            // Call your checkout API here
            const response = await axios.post(`https://luna-backend-1.onrender.com/api/orders/create`, orderData);

            // If checkout is successful, remove the items from cart
            await handleRemoveSelected();

            // Redirect to order confirmation or show success message
            alert(`Order placed successfully! Order ID: ${response.data.orderId}`);

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

    // Initial data loading
    useEffect(() => {
        fetchCart();
        fetchAddresses();
    }, [fetchCart, fetchAddresses]);

    const { subtotal, tax, deliveryCharge, grandTotal, selectedCount } = calculateSelectedTotals();

    return (
        <>
            <Navbar />
            <div className="container my-5">
                <h2 className="text-center mb-4">My Cart</h2>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : cart.length === 0 ? (
                    <div className="text-center">
                        <p className="fs-5 text-muted">Your cart is empty</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.href = "/dashboard"}
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="d-flex justify-content-between mb-3">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="selectAll"
                                    checked={selectAll}
                                    onChange={toggleSelectAll}
                                />
                                <label className="form-check-label" htmlFor="selectAll">
                                    Select All ({selectedProducts.length} selected)
                                </label>
                            </div>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleRemoveSelected}
                                disabled={selectedProducts.length === 0}
                            >
                                Remove Selected
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th style={{ width: "50px" }}>Select</th>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item) => (
                                        <tr key={`${item.product._id}-${item.size || ''}-${item.color || ''}`}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(item.product._id)}
                                                    onChange={() => toggleProductSelection(item.product._id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={item.product.images?.[0] || "/fallback.png"}
                                                        alt={item.product.name}
                                                        className="img-thumbnail me-3"
                                                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "/fallback.png";
                                                        }}
                                                    />
                                                    <div>
                                                        <h6 className="mb-1">{item.product.name}</h6>
                                                        <div className="d-flex gap-2">
                                                            {item.size && (
                                                                <small className="text-muted">
                                                                    <strong>Size:</strong> {item.size}
                                                                </small>
                                                            )}
                                                            {item.color && (
                                                                <small className="text-muted">
                                                                    <strong>Color:</strong> {item.color}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>₹{item.product.price.toFixed(2)}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1, item.size, item.color)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3">{item.quantity}</span>
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1, item.size, item.color)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </td>
                                            <td>₹{(item.product.price * item.quantity).toFixed(2)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleRemoveFromCart(item.product._id, item.size, item.color)}
                                                >
                                                    Remove
                                                </button>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="row mt-4">
                            <div className="col-md-6">
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

                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-header bg-dark text-white">
                                        <h5 className="mb-0">Order Summary</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Selected Items:</span>
                                            <span>{selectedCount}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Subtotal:</span>
                                            <span>₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Tax (5%):</span>
                                            <span>₹{tax.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Delivery Charge:</span>
                                            <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge.toFixed(2)}`}</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between fw-bold fs-5">
                                            <span>Total:</span>
                                            <span>₹{grandTotal.toFixed(2)}</span>
                                        </div>
                                        <button
                                            className="btn btn-dark w-100 mt-3"
                                            onClick={handleCheckout}
                                            disabled={selectedCount === 0 || !selectedAddress}
                                        >
                                            Proceed to Checkout ({selectedCount} items)
                                        </button>
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
                                            <h5 className="modal-title">Add New Address</h5>
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
            </div>
            <Footer />
        </>
    );
};

export default MyCart;