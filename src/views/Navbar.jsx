import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CategoryModal from "./CategoryModal"; // Import the new component

function Navbar() {
  const navigate = useNavigate();
  const categoryModalRef = useRef(null);
  const [categories, setCategories] = useState([]);

  const openCategoryModal = () => {
    const modal = new window.bootstrap.Modal(categoryModalRef.current);
    modal.show();
  };

  useEffect(() => {
    axios.get("https://luna-backend-1.onrender.com/api/category/getall-cat")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          console.error("Invalid category data", res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories", err);
      });
  }, []);

  const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
  const userId = storedUser.userId;

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await axios.get(`https://luna-backend-1.onrender.com/api/users/getcartcount/${userId}`);
        setCartCount(response.data.cartCount);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    if (userId) {
      fetchCartCount();
    }
  }, [userId]);

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <button
            className="navbar-toggler btn btn-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarText"
            aria-controls="navbarText"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav w-100 justify-content-center justify-content-lg-end gap-4 nav nav-underline">
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/dashboard">Home</Link>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-link mx-2" onClick={openCategoryModal}>
                  Category
                </button>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/dashboard/most-wanted">Most Wanted</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/dashboard/new-arrivals">New Arrivals</Link>
              </li>
              <li className="nav-item d-flex align-items-center">
                <div className="position-relative">
                  <button
                    className="btn"
                    type="button"
                    onClick={() => navigate('/dashboard/my-cart')}
                  >
                    <i className="fa-solid fa-cart-shopping fa-xl" style={{ color: "#fff" }}></i>
                    {cartCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </li>
              <li className="nav-item d-flex align-items-center">
                <button className="btn" type="button" onClick={() => navigate('/dashboard/Profile')}>
                  <i className="fa-solid fa-user fa-xl" style={{ color: "#fff" }}></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Category Modal - Now using the separate component */}
      <CategoryModal modalRef={categoryModalRef} categories={categories} />
    </>
  );
}

export default Navbar;