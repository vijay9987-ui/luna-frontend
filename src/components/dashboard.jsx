import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../views/Navbar";
import Footer from "../views/Footer";
import axios from "axios";
import ProductDetails from "./productDetails";


const Dashboard = () => {
    const navigate = useNavigate();




    const images = [
        "src/assets/Dashboard1.jpg",
        "src/assets/Dashboard2.jpg",
        "src/assets/Dashboard3.jpg",
    ];

    const [categories, setCategories] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [mostWantedProducts, setMostWantedProducts] = useState([]);
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]); // Store added items

    const [wishlist, setWishlist] = useState([]);
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await fetch(`https://luna-backend-1.onrender.com/api/users/wishlist/${userId}`);
                const data = await res.json();
                setWishlist(data.wishlist.map(item => item._id));
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };
        fetchWishlist();
    }, [userId]);

    const toggleWishlist = async (productId) => {
        try {
            const res = await fetch(`https://luna-backend-1.onrender.com/api/products/wishlist/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
            });
            const data = await res.json();

            if (data.isInWishlist) {
                setWishlist((prev) => [...prev, productId]);
            } else {
                setWishlist((prev) => prev.filter(id => id !== productId));
            }
        } catch (error) {
            console.error("Error toggling wishlist", error);
        }
    };



    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("https://luna-backend-1.onrender.com/api/products/getproducts");
                // Optional: Filter top-rated or latest products
                setNewArrivalsProducts(response.data.slice(0, 4)); // adjust slice as needed
                setRecentlyViewedProducts(response.data.slice(5, 10));
                setMostWantedProducts(response.data.slice(11, 15));
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        // Redirect to login if session is not found
        const user = sessionStorage.getItem("user");
        if (!user) {
            navigate('/');
        }
    }, [navigate]);


    // ✅ Fetch categories from backend
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



    return (
        <>
            <Navbar />
            <div className="container d-flex justify-content-center ">
                <div className="card text-bg-dark position-relative w-100">
                    <img
                        src={images[currentImageIndex]}
                        className="card-img img-fluid"
                        alt="Latest Fashion"
                    />
                    <div className="card-img-overlay d-flex flex-column justify-content-center align-items-center text-center"
                        style={{
                            backdropFilter: currentImageIndex !== null ? "blur(8px)" : "none", // Apply blur only when image exists
                            background: "rgba(0, 0, 0, 0.4)",
                            borderRadius: "10px",
                            padding: "20px",
                            transition: "background-image 1s ease-in-out",
                        }}>

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
                            <a href="/dashboard/new-arrivals" className="btn btn-light btn-lg" onClick={() => setStep(1)}>Shop Now</a>
                        </center>
                    </div>
                </div>
            </div>


            <br />

            {step === 1 && (
                <>
                    <>
                        {/* Recently Viewed */}
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

                        {/* Horizontal Scrollable Recently visited Products */}
                        <div
                            className="d-flex overflow-auto py-2 mx-5 custom-scroll"
                            style={{ gap: "1rem", scrollSnapType: "x mandatory" }}
                        >
                            {recentlyViewedProducts.map((product) => {
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
                                        {/* Image wrapper with wishlist icon */}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(product._id);
                                                }}
                                            >
                                                <i
                                                    className={`fa-heart fa-2xl ${isInWishlist ? "fa-solid" : "fa-regular"}`}
                                                    style={{
                                                        color: isInWishlist ? "#ff0000" : "#000000",
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
                            })}

                        </div>


                    </>
                    <br />
                    <>
                        {/* Category */}
                        <div className="container">
                            <div className="row align-items-center text-center text-md-start">
                                <div className="col-12 col-md-4"></div>
                                <div className="col-12 col-md-4 text-center">
                                    <h2 style={{ color: "#000000" }}>Category</h2>
                                </div>
                                <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
                                    <a href="">
                                        Know More
                                        <i className="fa-solid fa-arrow-right-to-bracket fa-sm ms-1" style={{ color: "#404bdd" }}></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <br /><br />

                        {/* Horizontal Scrollable Category Cards */}
                        <div
                            className="d-flex overflow-auto py-2 mx-5 custom-scroll"
                            style={{ gap: "1rem", scrollSnapType: "x mandatory" }}
                        >
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
                                        //src={`src/components/asset/${category.categoryName.toLowerCase()}.png`}
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




                    </>
                    <br />
                    <>
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

                        {/* Horizontal Scrollable Most Wanted Products */}
                        <div
                            className="d-flex overflow-auto py-2 mx-5 custom-scroll"
                            style={{ gap: "1rem", scrollSnapType: "x mandatory" }}
                        >
                            {mostWantedProducts.map((product) => {
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
                                        {/* Image wrapper with wishlist icon */}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(product._id);
                                                }}
                                            >
                                                <i
                                                    className={`fa-heart fa-2xl ${isInWishlist ? "fa-solid" : "fa-regular"}`}
                                                    style={{
                                                        color: isInWishlist ? "#ff0000" : "#000000",
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
                            })}

                        </div>



                    </>
                    <br />
                    <>
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

                        {/* Horizontal Scrollable New Arrival Products */}
                        <div
                            className="d-flex overflow-auto py-2 mx-5 custom-scroll"
                            style={{ gap: "1rem", scrollSnapType: "x mandatory" }}
                        >
                            {newArrivalsProducts.map((product) => {
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
                                        {/* Image wrapper with wishlist icon */}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(product._id);
                                                }}
                                            >
                                                <i
                                                    className={`fa-heart fa-2xl ${isInWishlist ? "fa-solid" : "fa-regular"}`}
                                                    style={{
                                                        color: isInWishlist ? "#ff0000" : "#000000",
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
                            })}

                        </div>

                    </>
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
