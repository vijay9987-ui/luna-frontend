const [profileImage, setProfileImage] = useState(() => localStorage.getItem("profileImage") || "");

const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    const savedUser = JSON.parse(sessionStorage.getItem("user"));
    const mobileNumber = savedUser?.mobileNumber;

    if (!mobileNumber) {
        console.error("No mobile number found");
        return;
    }

    try {
        const res = await fetch(`https://luna-backend-1.onrender.com/api/profile/uploadpic/${mobileNumber}`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (res.ok) {
            console.log("Uploaded successfully:", data);
            setProfileImage(`https://luna-backend-1.onrender.com${data.imageUrl}`);
        } else {
            console.error("Upload failed:", data.message);
        }
    } catch (err) {
        console.error("Error uploading image:", err);
    }
};

useEffect(() => {
    const savedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const mobile = savedUser.mobileNumber;

    if (mobile) {
        axios.get(`https://luna-backend-1.onrender.com/api/profile/profilepic/${mobile}`)
            .then(res => {
                const profilePicUrl = res.data?.profilePic;
                if (profilePicUrl) {
                    setProfileImage(profilePicUrl); // <- direct URL
                }
            })
            .catch(err => {
                console.error("Failed to fetch profile picture", err);
            });
    }
}, []);

<>

<div className="me-3 position-relative">
    <label htmlFor="profileUpload" style={{ cursor: "pointer" }}>
        {profileImage ? (
            <img src={profileImage} alt="Profile" className="rounded-circle" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
        ) : (
            <div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center" style={{ width: "60px", height: "60px", color: "#fff" }}>
                <i className="fa-solid fa-user"></i>
            </div>
        )}
    </label>
    <input
        id="profileUpload"
        type="file"
        accept="image/*"
        onChange={handleProfileImageUpload}
        style={{ display: "none" }}
    />
</div>



//<i className="fa-light fa-heart" style="color: #ff0000;"></i>

{/* Wishlist Icon */ }
<div
className="position-absolute"
style={{
    top: "10px",
    right: "10px",
    zIndex: 10,
    cursor: "pointer",
}}
onClick={(e) => {
    e.stopPropagation(); // prevent card click if needed
    // Add your addToWishlist logic here
    console.log("Add to wishlist:", product._id);
}}
>
<i className="fa-light fa-heart" style={{ color: "#ff0000" }}></i>
</div>

<div className="container-fluid">
                <div className="row align-items-center">
                    <div className="col-12 col-md-6 col-lg-4 d-flex justify-content-center">
                        <img
                            src={selectedItem.images?.[0] || "fallback.png"}
                            alt={selectedItem.name}
                            className="img-fluid rounded"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                    </div>

                    <div className="col-12 col-md-6 col-lg-8 mt-4 mt-md-0">
                        <div className="card bg-dark text-white border-0 shadow-sm p-3 h-100">
                            <h4 className="mb-3">Product Details</h4>
                            <ul className="list-group list-group-flush">

                                <li className="list-group-item bg-dark text-white d-flex justify-content-between">
                                    <span>Price:</span>
                                    <span>₹{selectedItem.price}</span>
                                </li>

                                {selectedItem.originalPrice && (
                                    <li className="list-group-item bg-dark text-white d-flex justify-content-between">
                                        <span>Original Price:</span>
                                        <span className="text-decoration-line-through text-secondary">
                                            ₹{selectedItem.originalPrice}
                                        </span>
                                    </li>
                                )}

                                <li className="list-group-item bg-dark text-white d-flex justify-content-between">
                                    <span>Quantity:</span>
                                    <span>{selectedItem.quantity}</span>
                                </li>

                                {selectedItem.sizes && (
                                    <li className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center">
                                        <span>Choose Size:</span>
                                        <select
                                            className="form-select w-50 bg-dark text-white border-light"
                                            value={selectedSize}
                                            onChange={(e) => setSelectedSize(e.target.value)}
                                        >
                                            <option value="">Select Size</option>
                                            {selectedItem.sizes.map((size, idx) => (
                                                <option key={idx} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </li>
                                )}

                                {selectedItem.colors && (
                                    <li className="list-group-item bg-dark text-white d-flex justify-content-between align-items-center">
                                        <span>Choose Color:</span>
                                        <select
                                            className="form-select w-50 bg-dark text-white border-light"
                                            value={selectedColor}
                                            onChange={(e) => setSelectedColor(e.target.value)}
                                        >
                                            <option value="">Select Color</option>
                                            {selectedItem.colors.map((color, idx) => (
                                                <option key={idx} value={color}>
                                                    {color}
                                                </option>
                                            ))}
                                        </select>
                                    </li>
                                )}

                                {selectedItem.rating && (
                                    <li className="list-group-item bg-dark text-white d-flex justify-content-between">
                                        <span>Rating:</span>
                                        <span>{selectedItem.rating} ★</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            </>

const quantityDec = () => {
    setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
};

const quantityInc = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
};

const handlePurchase = (product) => {
    setSelectedItem(product);
    setStep(2);
};
const addToCart = () => {
    if (selectedItem) {
        const newItem = { ...selectedItem, quantity, total: selectedItem.price * quantity };
        setCart(prevCart => [...prevCart, newItem]);
        navigate('/dashboard/my-cart', { state: { cart: [...cart, newItem] } }); // Navigate to MyCart
    }
};



import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductDetails = ({
    selectedItem,
    quantity,
    quantityDec,
    quantityInc,
    goBack
}) => {
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;

    // Reset selections when selectedItem changes
    useEffect(() => {
        setSelectedSize("");
        setSelectedColor("");
        setError(null);
        setSuccess(null);
    }, [selectedItem]);

    const addToCart = async () => {
        // Validate required selections
        if (selectedItem.sizes && !selectedSize) {
            setError("Please select a size");
            return;
        }
        if (selectedItem.colors && !selectedColor) {
            setError("Please select a color");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.post(
                `/api/cart/${userId}`,
                {
                    productId: selectedItem._id,
                    action: "increment",
                    quantity: quantity,
                    color: selectedColor || undefined,
                    size: selectedSize || undefined
                }
            );

            setSuccess("Product added to cart successfully!");
            // You might want to update your global cart state here if you're using context/redux
        } catch (err) {
            console.error("Error adding to cart:", err);
            setError(err.response?.data?.message || "Failed to add product to cart");
        } finally {
            setIsLoading(false);
        }
    };

    const getContrastColor = (hexColor) => {
        if (!hexColor) return '#000000';
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    };

    if (!selectedItem) return null;

    return (
        <div className="container my-4">
            <button
                className="btn btn-outline-secondary mb-3"
                onClick={goBack}
            >
                ← Back to Products
            </button>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                    ></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show">
                    {success}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess(null)}
                    ></button>
                </div>
            )}

            {/* ... rest of your JSX remains the same ... */}
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <img
                            src={selectedItem.images?.[0] || "/fallback.png"}
                            alt={selectedItem.name}
                            className="card-img-top p-3"
                            style={{
                                maxHeight: "400px",
                                objectFit: "contain",
                                backgroundColor: "#f8f9fa"
                            }}
                        />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body">
                            <h2 className="card-title mb-3">{selectedItem.name}</h2>

                            <div className="d-flex align-items-center mb-3">
                                {selectedItem.originalPrice && (
                                    <span className="text-decoration-line-through text-muted me-2">
                                        ₹{selectedItem.originalPrice}
                                    </span>
                                )}
                                <span className="h4 text-primary">
                                    ₹{selectedItem.price}
                                </span>
                                {selectedItem.originalPrice && (
                                    <span className="badge bg-success ms-2">
                                        {Math.round(
                                            (1 - selectedItem.price / selectedItem.originalPrice) * 100
                                        )}% OFF
                                    </span>
                                )}
                            </div>

                            {selectedItem.rating && (
                                <div className="mb-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <i
                                            key={i}
                                            className={`fas fa-star ${i < selectedItem.rating ? 'text-warning' : 'text-secondary'}`}
                                        ></i>
                                    ))}
                                    <span className="ms-2 small text-muted">
                                        ({selectedItem.ratingCount || 0} reviews)
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <p className="card-text">{selectedItem.description}</p>
                            </div>

                            {selectedItem.sizes && (
                                <div className="mb-4">
                                    <h5 className="mb-3">Select Size</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedItem.sizes.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedSize && (
                                        <div className="text-danger small mt-1">
                                            Please select a size
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedItem.colors && (
                                <div className="mb-4">
                                    <h5 className="mb-3">Select Color</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedItem.colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`btn rounded-circle p-0 ${selectedColor === color ? 'border-3 border-primary' : 'border-1 border-secondary'}`}
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: color,
                                                    position: 'relative'
                                                }}
                                                title={color}
                                            >
                                                {selectedColor === color && (
                                                    <i
                                                        className="fas fa-check position-absolute"
                                                        style={{
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            color: getContrastColor(color),
                                                            fontSize: '0.8rem'
                                                        }}
                                                    ></i>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedColor && (
                                        <div className="text-danger small mt-1">
                                            Please select a color
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="d-flex align-items-center mb-4">
                                <div className="d-flex align-items-center me-4">
                                    <button
                                        className="btn btn-outline-secondary px-3"
                                        onClick={quantityDec}
                                        disabled={isLoading || quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="mx-3">{quantity}</span>
                                    <button
                                        className="btn btn-outline-secondary px-3"
                                        onClick={quantityInc}
                                        disabled={isLoading}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="btn btn-success px-4 py-2 flex-grow-1"
                                    onClick={addToCart}
                                    disabled={
                                        isLoading ||
                                        (selectedItem.sizes && !selectedSize) ||
                                        (selectedItem.colors && !selectedColor)
                                    }
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                            </div>

                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        addToCart();
                                        navigate('/dashboard/my-cart');
                                    }}
                                    disabled={
                                        isLoading ||
                                        (selectedItem.sizes && !selectedSize) ||
                                        (selectedItem.colors && !selectedColor)
                                    }
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
        </div>
    );
};

export default ProductDetails;