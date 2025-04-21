import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../views/Footer";
import Navbar from "../views/Navbar";
import axios from "axios";
import ProductDetails from "./productDetails";

const Profile = () => {
    const [step, setStep] = useState(2);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [sessionUser, setSessionUser] = useState({});
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "none",
        email: "",
        mobile: "",
        username: ""
    });

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
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

    const navigate = useNavigate();
    const location = useLocation();

    // Add these state variables near the top of your Profile component
    const [cartItems, setCartItems] = useState([]);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;


    // Cart State - Replace your existing cart state with this
    const [cartData, setCartData] = useState({
        cartItems: [],
        totalItems: 0,
        subTotal: 0,
        deliveryCharge: 0,
        finalAmount: 0,
        loading: true,
        error: null
    });


    // Fetch cart data
    const fetchCartData = async () => {
        try {
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
    };

    useEffect(() => {
        if (userId && step === 5) { // Only fetch when on cart tab
            fetchCartData();
        }
    }, [userId, step]);

    // Handle quantity change
    const updateQuantity = async (productId, action) => {
        try {
            setCartData(prev => ({ ...prev, loading: true }));
            await axios.post(
                `https://luna-backend-1.onrender.com/api/users/addtocart/${userId}`,
                { productId, action }
            );
            await fetchCartData(); // Refresh cart data
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
            setCartData(prev => ({ ...prev, loading: true }));
            await axios.delete(
                `https://luna-backend-1.onrender.com/api/users/removefromcart/${userId}/${productId}`
            );
            await fetchCartData(); // Refresh cart data
        } catch (error) {
            console.error("Error removing item:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to remove item"
            }));
        }
    };

    // Handle checkout
    const proceedToCheckout = () => {
        if (cartData.cartItems.length === 0) {
            setCartData(prev => ({ ...prev, error: "Your cart is empty" }));
            return;
        }
        navigate('/dashboard/my-cart');
    };

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
        setSessionUser(storedUser);
        const userId = storedUser.userId;

        if (userId) {
            axios.get(`https://luna-backend-1.onrender.com/api/users/getuser/${userId}`)
                .then(res => {
                    const { profile, mobileNumber } = res.data;
                    setFormData({
                        firstName: profile?.firstName || "",
                        lastName: profile?.lastName || "",
                        gender: profile?.gender || "none",
                        email: profile?.email || "",
                        mobile: mobileNumber || "",
                        username: storedUser.username || ""
                    });
                })
                .catch(err => console.error("Failed to fetch profile:", err));
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
        const userId = storedUser.userId;

        try {
            const res = await axios.post(`https://luna-backend-1.onrender.com/api/users/user/createprofiledata/${userId}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                email: formData.email,
                mobile: formData.mobile
            });
            setMessage("Profile updated successfully!");
            setIsEditing(false);

            if (formData.mobile) {
                storedUser.mobileNumber = formData.mobile;
                sessionStorage.setItem("user", JSON.stringify(storedUser));
            }

            setTimeout(() => setMessage("Mobile number changed Successfully"), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    const handleChangeAdd = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const userId = sessionUser.userId;

        try {
            const res = await axios.post(`https://luna-backend-1.onrender.com/api/users/create-address/${userId}`, address);
            setAddresses(res.data.addresses);
            setAddress({
                name: "", mobile: "", email: "", addressline1: "", addressline2: "",
                city: "", state: "", country: "", pincode: "", type: "Home"
            });
            setShowAddressForm(false);
        } catch (err) {
            console.error("Failed to save address:", err);
        }
    };

    const handleDeleteAddress = async (index) => {
        const userId = sessionUser.userId;
        const addr = addresses[index];

        try {
            const res = await axios.delete(`https://luna-backend-1.onrender.com/api/users/remove-address/${userId}/${addr._id}`);
            setAddresses(res.data.addresses);
            if (selectedAddress?._id === addr._id) setSelectedAddress(null);
        } catch (err) {
            console.error("Failed to delete address:", err);
        }
    };

    const handleSelectAddress = (addr) => {
        setSelectedAddress(addr);
        //sessionStorage.setItem("selectedAddress", JSON.stringify(addr));
    };


    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const savedUser = JSON.parse(sessionStorage.getItem("user")) || {};
                const userId = savedUser.userId; // Or however you're storing user ID
                const res = await axios.get(`https://luna-backend-1.onrender.com/api/users/getaddress/${userId}`);
                setAddresses(res.data.addresses); // ✅ Fix: directly access 'addresses' from response
            } catch (err) {
                console.error("Error fetching addresses:", err);
            }
        };

        fetchAddresses();
    }, []);


    const [wishlistProducts, setWishlistProducts] = useState([]);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await fetch(`https://luna-backend-1.onrender.com/api/users/wishlist/${userId}`);
                const data = await res.json();
                //console.log("Fetched wishlist data:", data);

                const wishlistIds = data.wishlist.map(item => item._id);
                //console.log("Wishlist product IDs:", wishlistIds);

                const productResponses = await Promise.all(
                    wishlistIds.map(_id =>
                        fetch(`https://luna-backend-1.onrender.com/api/products/singleproduct/${_id}`)
                            .then(res => res.json())
                            .catch(err => {
                                console.error("Failed to fetch product:", _id, err);
                                return null;
                            })
                    )
                );

                const validProducts = productResponses.filter(p => p !== null);
                //console.log("Fetched products:", validProducts);
                setWishlistProducts(validProducts);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };


        if (userId) {
            fetchWishlist();
        }
    }, [userId]);

    const handleRemove = async (productId) => {
        try {
            const res = await fetch(`https://luna-backend-1.onrender.com/api/users/wishlist/${userId}/${productId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                // Filter out the removed product from the local state
                setWishlistProducts(prev => prev.filter(p => p._id !== productId));
            } else {
                console.error(data.message || 'Failed to remove product');
            }
        } catch (error) {
            console.error("Error removing product from wishlist:", error);
        }
    };

    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const quantityDec = () => {
        setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
    };

    const quantityInc = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };


    const handlePurchase = (product) => {
        setSelectedItem(product);
        setStep(6);
    };

    const addToCart = () => {
        if (selectedItem) {
            const newItem = { ...selectedItem, quantity, total: selectedItem.price * quantity };
            setCart(prevCart => [...prevCart, newItem]);
            navigate('/dashboard/my-cart', { state: { cart: [...cart, newItem] } }); // Navigate to MyCart
        }
    };


    return (
        <>
            <Navbar />
            <div className="container-fluid">
                <div className="row p-5">
                    {/* Sidebar */}
                    <div className="col-sm-4 p-5 border border-2">
                        <div className="d-flex align-items-center border border-1 p-3 shadow-sm rounded">
                            <i className="fa-solid fa-user fa-2xl me-3" style={{ color: "#000000" }}></i>
                            <div>
                                <h4>Hello,</h4>
                                <p>{sessionUser.username}</p>
                            </div>
                        </div><br />
                        <div className="border border-1 p-3 shadow-sm rounded">
                            <ul className="list-group list-group-flush">
                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-solid fa-heart me-2" ></i>
                                    <a className="btn" data-bs-toggle="collapse" onClick={() => setStep(4)} style={{ cursor: "pointer" }} href="#collapsemywishlist">My Wishlist</a>
                                </p>
                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-solid fa-truck me-2"></i>
                                    <a className="btn" onClick={() => setStep(1)} data-bs-toggle="collapse" href="#collapseorders">My orders</a>
                                </p>
                                <div className="collapse" id="collapseorders">
                                    <ul className="rounded">
                                        <li className="list-group-item">On the Way</li>
                                        <li className="list-group-item">Delivered</li>
                                        <li className="list-group-item">Cancelled</li>
                                        <li className="list-group-item">Returned</li>
                                    </ul>
                                </div>
                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-solid fa-cart-shopping me-2"></i>
                                    <a
                                        className="btn"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setStep(5)}
                                    >
                                        My Cart
                                    </a>
                                </p>
                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-regular fa-user me-2"></i>
                                    <a className="btn" data-bs-toggle="collapse" href="#collapsesettings" onClick={() => setStep(2)}>Account Settings</a>
                                </p>
                                <div className="collapse" id="collapsesettings">
                                    <ul className="rounded">
                                        <li className="list-group-item"><a onClick={() => setStep(2)} style={{ cursor: "pointer" }}>Profile Information</a></li>
                                        <li className="list-group-item"><a onClick={() => setStep(3)} style={{ cursor: "pointer" }}>Manage address</a></li>
                                        <li className="list-group-item">Notifications</li>
                                    </ul>
                                </div>
                                <p className="d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                                    <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
                                    <a onClick={handleLogout}>Logout</a>
                                </p>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-sm-8 p-5 border border-2">
                        {step === 1 && <h3>Here is my Orders</h3>}

                        {step === 2 && (
                            <form className="p-4 border rounded shadow-sm bg-light">
                                <div className="d-flex justify-content-between mb-3">
                                    <h4>Profile Information</h4>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${isEditing ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
                                    >
                                        {isEditing ? "Save" : "Edit"}
                                    </button>
                                </div>
                                {message && <p className="text-success">{message}</p>}

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label>First Name</label>
                                        <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} readOnly={!isEditing} />
                                    </div>
                                    <div className="col-md-6">
                                        <label>Last Name</label>
                                        <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} readOnly={!isEditing} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label>Gender</label>
                                    <select className="form-select" name="gender" value={formData.gender} onChange={handleChange} disabled={!isEditing}>
                                        <option value="none" disabled>Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label>Email</label>
                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} readOnly={!isEditing} />
                                </div>

                                <div className="mb-3">
                                    <label>Mobile</label>
                                    <input type="tel" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} readOnly={!isEditing} maxLength={10} />
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <>
                                <h5>Manage Delivery Address</h5>
                                {addresses.length > 0 ? addresses.map((addr, i) => (
                                    <div key={i} className={`border p-3 my-2 ${selectedAddress?._id === addr._id ? "border-primary" : ""}`}>
                                        <input
                                            type="radio"
                                            checked={selectedAddress?._id === addr._id}
                                            onChange={() => handleSelectAddress(addr)}
                                        />
                                        <strong className="ms-2">{addr.name}</strong>
                                        <p>
                                            {addr.name} | {addr.addressline1}, {addr.addressline2}, {addr.mobile}, {addr.city}, {addr.pincode} ({addr.type})
                                        </p>
                                        <button
                                            className="btn btn-danger btn-sm me-2"
                                            onClick={() => handleDeleteAddress(i)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )) : <p>No saved addresses.</p>}


                                <button className="btn btn-outline-dark mt-2" onClick={() => setShowAddressForm(true)}>Add New Address</button>

                                {showAddressForm && (
                                    <form className="row g-3 mt-4" onSubmit={handleSaveAddress}>
                                        {/* Basic Info */}
                                        <div className="col-md-6">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-control" value={address.name} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Mobile</label>
                                            <input type="text" name="mobile" className="form-control" value={address.mobile} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Email</label>
                                            <input type="email" name="email" className="form-control" value={address.email} onChange={handleChangeAdd} required />
                                        </div>

                                        {/* Address Details */}
                                        <div className="col-md-12">
                                            <label className="form-label">Address Line 1</label>
                                            <input type="text" name="addressline1" className="form-control" value={address.addressline1} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Address Line 2</label>
                                            <input type="text" name="addressline2" className="form-control" value={address.addressline2} onChange={handleChangeAdd} />
                                        </div>

                                        {/* Location */}
                                        <div className="col-md-6">
                                            <label className="form-label">City</label>
                                            <input type="text" name="city" className="form-control" value={address.city} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">State</label>
                                            <input type="text" name="state" className="form-control" value={address.state} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Country</label>
                                            <input type="text" name="country" className="form-control" value={address.country} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Pincode</label>
                                            <input type="text" name="pincode" className="form-control" value={address.pincode} onChange={handleChangeAdd} required />
                                        </div>

                                        {/* Address Type */}
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
                                                    />
                                                    <label className="form-check-label">{type}</label>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="col-12 text-center">
                                            <button type="submit" className="btn btn-success">Save Address</button>
                                        </div>
                                    </form>

                                )}
                            </>
                        )}

                        {(step === 4 &&
                            <>
                                <div className="container my-4">
                                    <h3 className="text-center mb-4">My Wishlist</h3>

                                    <div className="wishlist-wrapper hide-scrollbar" style={{ maxHeight: "100vh", overflowY: "auto" }}>
                                        {wishlistProducts.length ? (
                                            wishlistProducts.map((product, index) => (
                                                <div
                                                    key={product._id || `wishlist-${index}`}
                                                    className="position-relative border mb-3 shadow-sm p-2 rounded bg-white"
                                                    onClick={() => handlePurchase(product)}
                                                >
                                                    <div className="d-flex flex-column flex-sm-row align-items-start">
                                                        {/* Product Image */}
                                                        <img
                                                            src={product.images?.[0] || "fallback.png"}
                                                            alt={product.name}
                                                            className="rounded img-fluid"
                                                            style={{ height: "100px", width: "100px", objectFit: "cover" }}
                                                        />

                                                        {/* Product Info */}
                                                        <div className="ms-sm-3 mt-2 mt-sm-0 flex-grow-1 d-flex flex-column justify-content-start w-100">
                                                            <h3 className="fw-bold fs-5 mb-1 text-truncate">{product.name}</h3>
                                                            <span className="fw-semibold text-secondary">₹{product.price}</span>
                                                        </div>

                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => handleRemove(product._id)}
                                                            className="position-absolute top-0 end-0 btn btn-sm"
                                                        >
                                                            <i className="fa-solid fa-xmark text-dark"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="border mb-3 shadow-sm p-3 rounded text-center">
                                                No items in wishlist
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </>
                        )}

                        {step === 5 && (
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




                                <div className="col-12 col-sm-6 col-md-6">
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
                                                onClick={proceedToCheckout}
                                                disabled={cartData.loading || cartData.cartItems.length === 0}
                                            >
                                                {cartData.loading ? 'Processing...' : 'Proceed to Checkout'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}

                        {step === 6 && (
                            <ProductDetails
                                selectedItem={selectedItem}
                                quantity={quantity}
                                quantityDec={quantityDec}
                                quantityInc={quantityInc}
                                addToCart={addToCart}
                                goBack={() => setStep(1)}
                            />
                        )}

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;
