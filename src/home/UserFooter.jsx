import React from "react";
import logo from '../components/asset/luna-logo.jpeg'

function UserFooter() {
  return (
    <footer className="footer bg-black text-white py-5" style={{ borderTop: "solid 1px white"}}>
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Logo & About Section */}
          <div className="col-md-4 mb-4 mb-md-0">
            <img
              src={logo}
              alt="Logo"
              className="img-fluid mb-3 rounded-pill"
              style={{ height: "100px", width: "120px"}}
            />
            <p>
              Drawing is a visual art that uses an instrument to mark paper or another two-dimensional surface.
            </p>
            {/* Social Icons */}
            <div className="d-flex justify-content-center justify-content-md-start gap-3 mt-3">
              <i className="fa-brands fa-square-instagram fa-2x" style={{ color: "#d6dae1" }}></i>
              <i className="fa-brands fa-youtube fa-2x" style={{ color: "#d6dae1" }}></i>
              <i className="fa-brands fa-facebook fa-2x" style={{ color: "#d6dae1" }}></i>
            </div>
          </div>

          {/* Footer Links */}
          <div className="col-md-8">
            <div className="row">
              {/* Help Section */}
              <div className="col-12 col-sm-4 mb-4">
                <h4 className="fw-bold">Help</h4>
                <p>Contact Us & creatives</p>
                <p>www.Etrenaltek.com</p>
                <p>Hyderabad, KPHB, Sri Nagar Colony, 500038</p>
              </div>

              {/* Company Section */}
              <div className="col-12 col-sm-4 mb-4">
                <h4 className="fw-bold">Company</h4>
                <p>About Us</p>
                <p>Services</p>
                <p>Support</p>
              </div>

              {/* Policies Section */}
              <div className="col-12 col-sm-4 mb-4">
                <h4 className="fw-bold">Our Policies</h4>
                <p>Terms & Conditions</p>
                <p>Privacy Policy</p>
                <p>Copyright Matters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default UserFooter;
