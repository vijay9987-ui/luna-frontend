import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const categoryModalRef = useRef(null);
  const [step, setStep] = useState("");
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
      // You might want to set up polling or refresh this when cart changes
    }
  }, [userId]);

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
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
                    <i className="fa-solid fa-cart-shopping fa-xl" style={{ color: "#000000" }}></i>
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
                  <i className="fa-solid fa-user fa-xl" style={{ color: "#000000" }}></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Category Modal */}
      <div className="modal fade" id="categoryModal" ref={categoryModalRef} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow">
            <div className="modal-header border-0">
              <h5 className="modal-title text-dark fw-bold">Browse Categories</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body py-4">
              <div className="container-fluid">
                <div className="row">
                  {/* Category List */}
                  <div className="col-12 col-md-4 border-end mb-3 mb-md-0">
                    {categories.map((Category) => (
                      <p
                        key={Category._id}
                        className={`py-2 px-3 rounded-3 mb-2 ${step === Category.categoryName ? 'bg-dark text-white' : 'text-dark bg-light'
                          }`}
                        onClick={() => setStep(Category.categoryName)}
                        style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                      >
                        {Category.categoryName}
                      </p>
                    ))}
                  </div>

                  {/* Subcategory View */}
                  <div className="col-12 col-md-8">
                    <div className="row g-2">
                      {categories
                        .filter((Category) => Category.categoryName === step)
                        .flatMap((Category) =>
                          Category.subcategories.map((sub, index) => (
                            <div key={index} className="col-6 col-sm-4 col-lg-3">
                              <div
                                className="bg-light text-dark border border-1 rounded-pill px-3 py-2 text-center fw-semibold"
                                style={{ cursor: "pointer", fontSize: "0.95rem" }}
                              >
                                {sub}
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}

export default Navbar;
