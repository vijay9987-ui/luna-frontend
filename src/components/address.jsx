import { useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "../views/Navbar";
import Footer from "../views/Footer";

const MyCart = () => {
    const location = useLocation();
    const [cart, setCart] = useState(location.state?.cart || []);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [orders, setOrders] = useState([]); // Stores completed orders

    const [address, setAddress] = useState({
        name: "",
        mobile: "",
        address: "",
        city: "",
        pincode: "",
        type: "Home"
    });

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        setAddresses([...addresses, address]);
        setAddress({ name: "", mobile: "", address: "", city: "", pincode: "", type: "Home" });
        setShowAddressForm(false);
    };

    const handleDeleteAddress = (index) => {
        setAddresses(addresses.filter((_, i) => i !== index));
        if (selectedAddress === addresses[index]) {
            setSelectedAddress(null);
        }
    };

    const handleQuantityChange = (index, newQuantity) => {
        if (newQuantity < 1) return; // Prevent negative values
        const updatedCart = cart.map((item, i) =>
            i === index ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item
        );
        setCart(updatedCart);
    };

    const handleBuyNow = () => {
        if (selectedAddress) {
            // Save current cart as an order
            const newOrder = { items: cart, address: selectedAddress, date: new Date().toLocaleString() };
            setOrders([...orders, newOrder]);

            alert(`Order placed successfully! Delivering to: ${selectedAddress.address}`);

            // Clear the cart after order placement
            setCart([]);
        } else {
            alert("Please select an address before proceeding.");
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;

    return (
        <>
            <Navbar />
            <div className="container my-5">
                <h2 className="text-center">My Cart</h2>
                {cart.length === 0 ? (
                    orders.length > 0 ? (
                        <>
                            <h3 className="text-center">Order Details</h3>
                            {orders.map((order, index) => (
                                <div key={index} className="border p-3 my-3">
                                    <h5>Order #{index + 1} - {order.date}</h5>
                                    <p><strong>Delivering to:</strong> {order.address.name}, {order.address.address}, {order.address.city}, {order.address.pincode}</p>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Image</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.name}</td>
                                                    <td><img src={item.image} alt={item.name} style={{ width: "50px" }} /></td>
                                                    <td>{item.quantity}</td>
                                                    <td>${item.price.toFixed(2)}</td>
                                                    <td>${item.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </>
                    ) : (
                        <p className="text-center">Your cart is empty.</p>
                    )
                ) : (
                    <>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Image</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td><img src={item.image} alt={item.name} style={{ width: "50px" }} /></td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                                className="form-control"
                                                style={{ width: "60px" }}
                                            />
                                        </td>
                                        <td>${item.price.toFixed(2)}</td>
                                        <td>${item.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="text-end">
                            <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
                            <p><strong>Tax (5%):</strong> ${tax.toFixed(2)}</p>
                            <p><strong>Grand Total:</strong> ${grandTotal.toFixed(2)}</p>
                        </div>

                        <div className="mt-4">
                            <h5>Select Delivery Address</h5>
                            {addresses.length > 0 ? (
                                addresses.map((addr, index) => (
                                    <div key={index} className={`border p-3 my-2 ${selectedAddress === addr ? 'border-primary' : ''}`}>
                                        <input
                                            type="radio"
                                            name="selectedAddress"
                                            checked={selectedAddress === addr}
                                            onChange={() => setSelectedAddress(addr)}
                                        />
                                        <strong className="ms-2">{addr.name}</strong>
                                        <p>{addr.mobile} | {addr.address}, {addr.city}, {addr.pincode} ({addr.type})</p>
                                        <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteAddress(index)}>Delete</button>
                                    </div>
                                ))
                            ) : (
                                <p>No saved addresses.</p>
                            )}

                            <button className="btn btn-outline-primary mt-2" onClick={() => setShowAddressForm(true)}>
                                Add New Address
                            </button>
                        </div>

                        {/* Address Form */}
                        {showAddressForm && (
                            <div className="mt-4">
                                <h3>Add New Address</h3>
                                <form className="row g-3" onSubmit={handleSaveAddress}>
                                    <div className="col-md-6">
                                        <label className="form-label">Name</label>
                                        <input type="text" className="form-control" name="name" value={address.name} onChange={handleChangeAdd} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Mobile</label>
                                        <input type="text" className="form-control" name="mobile" value={address.mobile} onChange={handleChangeAdd} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Address</label>
                                        <input type="text" className="form-control" name="address" value={address.address} onChange={handleChangeAdd} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">City</label>
                                        <input type="text" className="form-control" name="city" value={address.city} onChange={handleChangeAdd} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Pincode</label>
                                        <input type="text" className="form-control" name="pincode" value={address.pincode} onChange={handleChangeAdd} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label me-2">Address Type:</label>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="type" value="Home" checked={address.type === "Home"} onChange={handleChangeAdd} />
                                            <label className="form-check-label">Home</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="radio" name="type" value="Office" checked={address.type === "Office"} onChange={handleChangeAdd} />
                                            <label className="form-check-label">Office</label>
                                        </div>
                                    </div>
                                    <div className="col-12 text-center">
                                        <button type="submit" className="btn btn-success">Save Address</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <button
                                className="btn btn-lg btn-primary"
                                onClick={handleBuyNow}
                                disabled={!selectedAddress}
                            >
                                Buy Now
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyCart;
