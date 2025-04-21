import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../views/Navbar";
import Footer from "../views/Footer";
import axios from "axios";
import ProductDetails from "./productDetails";

const Dashboard = () => {
    const navigate = useNavigate();

    const images = [
        "https://img.freepik.com/free-photo/young-woman-with-shopping-bags-beautiful-dress_1303-17550.jpg?ga=GA1.1.2026462327.1743072904&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/joyful-european-lady-summer-hat-dancing-yellow-background-debonair-girl-long-skirt-laughing-while-posing-studio_197531-25996.jpg?ga=GA1.1.2026462327.1743072904&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/happy-lady-stylish-skirt-boater-posing-pink-wall_197531-23653.jpg?ga=GA1.1.2026462327.1743072904&semt=ais_hybrid&w=740",
    ];

    const [categories, setCategories] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [mostWantedProducts, setMostWantedProducts] = useState([]);
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;

    // Fetch wishlist for the user
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`https://luna-backend-1.onrender.com/api/users/wishlist/${userId}`);
                const data = await res.json();
                if (data.wishlist) {
                    setWishlist(data.wishlist.map(item => item._id));
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };
        fetchWishlist();
    }, [userId]);

    // Toggle product in wishlist
    const toggleWishlist = async (productId, e) => {
        e.stopPropagation();
        if (!userId) {
            navigate('/');
            return;
        }
        try {
            const res = await fetch(`https://luna-backend-1.onrender.com/api/products/wishlist/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
            });
            const data = await res.json();

            setWishlist(prev => 
                data.isInWishlist 
                    ? [...prev, productId] 
                    : prev.filter(id => id !== productId)
            );
        } catch (error) {
            console.error("Error toggling wishlist", error);
        }
    };

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("https://luna-backend-1.onrender.com/api/products/getproducts");
                const products = response.data;
                setNewArrivalsProducts(products.slice(0, 4));
                setRecentlyViewedProducts(products.slice(5, 10));
                setMostWantedProducts(products.slice(11, 15));
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    // Image slider effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    // Check authentication
    useEffect(() => {
        const user = sessionStorage.getItem("user");
        if (!user) {
            navigate('/');
        }
    }, [navigate]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://luna-backend-1.onrender.com/api/category/getall-cat");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Quantity handlers
    const quantityDec = () => {
        setQuantity(prev => Math.max(prev - 1, 1));
    };

    const quantityInc = () => {
        setQuantity(prev => prev + 1);
    };

    // Product selection handler
    const handlePurchase = (product) => {
        setSelectedItem(product);
        setStep(2);
    };

    // Add to cart handler
    const addToCart = () => {
        if (selectedItem) {
            const newItem = { 
                ...selectedItem, 
                quantity, 
                total: selectedItem.price * quantity 
            };
            const updatedCart = [...cart, newItem];
            setCart(updatedCart);
            navigate('/dashboard/my-cart', { state: { cart: updatedCart } });
        }
    };

    // Render product card component
    const renderProductCard = (product) => {
        const isInWishlist = wishlist.includes(product._id);
        
        return (
            <div
                key={product._id}
                className="card shadow-sm overflow-hidden flex-shrink-0 mx-3"
                style={{
                    width: "16rem",
                    scrollSnapAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#000",
                    color: "#fff",
                    border: "1px solid #333",
                    transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => handlePurchase(product)}
            >
                <div style={{ position: "relative" }}>
                    <img
                        src={product.images?.[0] || "fallback.png"}
                        className="card-img img-fluid"
                        alt={product.name}
                        style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div
                        className="position-absolute"
                        style={{
                            top: "10px",
                            right: "10px",
                            zIndex: 10,
                            cursor: "pointer",
                        }}
                        onClick={(e) => toggleWishlist(product._id, e)}
                    >
                        <i
                            className={`fa-heart fa-2xl ${isInWishlist ? "fa-solid" : "fa-regular"}`}
                            style={{
                                color: isInWishlist ? "#ff0000" : "#ffffff",
                                fontSize: "1.8rem"
                            }}
                        ></i>
                    </div>
                </div>

                <div className="card-body text-center">
                    <h5 className="card-title text-white">{product?.name}</h5>
                    <p className="card-text">
                        ₹{product?.price}
                        {product?.originalPrice && (
                            <span className="text-decoration-line-through ms-2" style={{ color: "grey" }}>
                                ₹{product.originalPrice}
                            </span>
                        )}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center">
                <div className="card text-bg-dark position-relative w-100">
                    <img
                        src={images[currentImageIndex]}
                        className="card-img img-fluid"
                        alt="Latest Fashion"
                    />
                    <div 
                        className="card-img-overlay d-flex flex-column justify-content-center align-items-center text-center"
                        style={{
                            backdropFilter: "blur(8px)",
                            background: "rgba(0, 0, 0, 0.4)",
                            borderRadius: "10px",
                            padding: "20px",
                            transition: "background-image 1s ease-in-out",
                        }}
                    >
                        <center>
                            <input
                                type="text"
                                className="form-control search-input search w-75 w-md-50 w-lg-25"
                                placeholder="Search"
                                style={{ color: "white" }}
                            />
                            <br />
                            <h1 className="text-light text-wrap text-center px-3" style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }}>
                                Level up Your Style With Our Summer Collections
                            </h1>
                            <br />
                            <a href="/dashboard/new-arrivals" className="btn btn-light btn-lg">
                                Shop Now
                            </a>
                        </center>
                    </div>
                </div>
            </div>

            <br />

            {step === 1 && (
                <>
                    {/* Recently Viewed Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000000" }}>Recently viewed</h2>
                            </div>
                            <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                                <a href="/dashboard">
                                    Know More
                                    <i className="fa-solid fa-arrow-right-to-bracket fa-sm ms-1" style={{ color: "#404bdd" }}></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <br /><br />

                    <div className="d-flex overflow-auto py-2 mx-5 custom-scroll" style={{ gap: "1rem", scrollSnapType: "x mandatory" }}>
                        {recentlyViewedProducts.map(renderProductCard)}
                    </div>

                    <br />

                    {/* Category Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000000" }}>Category</h2>
                            </div>
                            <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                                <a href="/dashboard/categories">
                                    Know More
                                    <i className="fa-solid fa-arrow-right-to-bracket fa-sm ms-1" style={{ color: "#404bdd" }}></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <br /><br />

                    <div className="d-flex overflow-auto py-2 mx-5 custom-scroll" style={{ gap: "1rem", scrollSnapType: "x mandatory" }}>
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="card text-bg-dark shadow-sm overflow-hidden flex-shrink-0 mx-3"
                                style={{
                                    width: "16rem",
                                    scrollSnapAlign: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <img
                                    src={category.imageUrl}
                                    className="card-img img-fluid"
                                    alt={category.categoryName}
                                    style={{ filter: "blur(5px)", height: "200px", objectFit: "cover" }}
                                />
                                <div className="card-img-overlay d-flex align-items-center justify-content-center">
                                    <h5 className="card-title text-center fw-bold text-dark">{category.categoryName}</h5>
                                </div>
                            </div>
                        ))}
                    </div>

                    <br />

                    {/* Most Wanted Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000000" }}>Most Wanted</h2>
                            </div>
                            <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                                <a href="/dashboard/most-wanted">
                                    Know More
                                    <i className="fa-solid fa-arrow-right-to-bracket fa-sm ms-1" style={{ color: "#404bdd" }}></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <br /><br />

                    <div className="d-flex overflow-auto py-2 mx-5 custom-scroll" style={{ gap: "1rem", scrollSnapType: "x mandatory" }}>
                        {mostWantedProducts.map(renderProductCard)}
                    </div>

                    <br />

                    {/* New Arrivals Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000000" }}>New Arrivals</h2>
                            </div>
                            <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                                <a href="/dashboard/new-arrivals">
                                    Know More
                                    <i className="fa-solid fa-arrow-right-to-bracket fa-sm ms-1" style={{ color: "#404bdd" }}></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <br /><br />

                    <div className="d-flex overflow-auto py-2 mx-5 custom-scroll" style={{ gap: "1rem", scrollSnapType: "x mandatory" }}>
                        {newArrivalsProducts.map(renderProductCard)}
                    </div>
                </>
            )}

            {step === 2 && (
                <ProductDetails
                    selectedItem={selectedItem}
                    quantity={quantity}
                    quantityDec={quantityDec}
                    quantityInc={quantityInc}
                    addToCart={addToCart}
                    goBack={() => setStep(1)}
                />
            )}
            <Footer />
        </>
    );
}

export default Dashboard;