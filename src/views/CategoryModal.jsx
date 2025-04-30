import React, { useState } from "react";

const CategoryModal = ({ modalRef, categories }) => {
  const [step, setStep] = useState("");

  return (
    <div className="modal fade" id="categoryModal" ref={modalRef} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-4 shadow">
          <div className="modal-header border-0">
            <h5 className="modal-title text-light fw-bold">Browse Categories</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
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
  );
};

export default CategoryModal;