import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const [mobileNumber, setMobileNumber] = useState("");
    const [enteredNumbers, setEnteredNumbers] = useState([]);
    const [error, setError] = useState("");
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState("");
    const [showLogo, setShowLogo] = useState(true);
    const [showLogin, setShowLogin] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            navigate("/dashboard");
        }

        // Animation sequence
        const timer1 = setTimeout(() => {
            setShowLogo(false);
        }, 4000); // Logo shows for 1.5 seconds

        const timer2 = setTimeout(() => {
            setShowLogin(true);
        }, 2700); // Login form appears 0.3s after logo starts fading

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [navigate]);

    // ... [rest of your existing state and handler functions] ...

    const handleInputChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        setMobileNumber(value);
        setError("");
        e.target.style.background = "transparent";
        e.target.style.color = "white";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mobileNumber.length !== 10) {
            setError("Enter a valid 10-digit mobile number.");
        } else {
            const newOtp = Math.floor(100000 + Math.random() * 900000);
            setGeneratedOtp(newOtp);
            setStep(2);
            setError("");
        }
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value.replace(/\D/g, ""));
        e.target.style.background = "transparent";
        e.target.style.color = "white";
    };

    const copyOtp = () => {
        navigator.clipboard.writeText(generatedOtp);
    };

    const verifyOtp = (e) => {
        e.preventDefault();
        if (otp === generatedOtp.toString()) {
            setEnteredNumbers([...enteredNumbers, mobileNumber]);
            setOtp("");
            setStep(3);
            setError("");
        } else {
            setError("Invalid OTP. Please try again.");
        }
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        e.target.style.background = "transparent";
        e.target.style.color = "white";
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();

        if (!username || username.length < 3 || username.length > 10) {
            setError("Enter a valid Username!!");
            return;
        }

        try {
            const response = await fetch("https://luna-backend-1.onrender.com/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, mobileNumber })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            sessionStorage.setItem("user", JSON.stringify({
                userId: data.user._id,
                username: data.user.username,
                mobileNumber: data.user.mobileNumber
            }));

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 text-white welcome">
            {/* Logo Animation */}
            {showLogo && (
                <div className="logo-animation-container">
                    <img
                        src="https://dcassetcdn.com/design_img/2507971/637258/637258_13453039_2507971_014d29b7_image.png"
                        className="logo-animation"
                        alt="Luna logo"
                    />
                </div>
            )}

            {/* Login Form */}
            <div className={`vh-100 w-100 d-flex justify-content-center align-items-center login-container ${showLogin ? 'login-visible' : ''}`}
                style={{ background: "rgba(0, 0, 0, 0.6)" }}>
                <div className="text-center p-4 rounded">
                    <img src="https://dcassetcdn.com/design_img/2507971/637258/637258_13453039_2507971_014d29b7_image.png"
                        style={{ height: "150px", width: "150px" }}
                        alt="Luna logo"
                        className="mb-3" />

                    {step === 1 && (
                        <form onSubmit={handleSubmit}>
                            <h2 className="fw-bold">Welcome Back !</h2>
                            <p className="text-white opacity-50">Please Login To Your Account And Continue Your Shopping</p>
                            <label className="mt-3">Enter Mobile Number</label><br /><br />
                            <div className="input-group mb-2">
                                <span className="input-group-text mobile-input">+91</span>
                                <input
                                    type="tel"
                                    className="form-control mobile-input"
                                    placeholder="Enter your mobile number"
                                    value={mobileNumber}
                                    onChange={handleInputChange}
                                    maxLength="10"
                                    style={{ background: "transparent", color: "white" }}
                                />
                            </div>
                            {error && <p className="text-danger">{error}</p>}
                            <button type="submit" className="btn w-100 mt-3 continue">Continue</button>
                            <div className="or-divider">
                                <hr /><span>or</span><hr />
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={verifyOtp}>
                            <h2 className="fw-bold">Welcome Back !</h2>
                            <p className="text-white opacity-100">Please enter the OTP sent to {mobileNumber}. <span onClick={() => setStep(1)}>Change</span></p>
                            {generatedOtp && (
                                <div className="mb-3">
                                    <input type="text" className="form-control text-center otp" style={{ background: "transparent", color: "white" }} value={generatedOtp} readOnly />
                                    <button type="button" className="btn btn-secondary mt-2 continue" onClick={copyOtp}>Copy OTP</button>
                                </div>
                            )}
                            <label className="mt-3">Enter OTP</label><br /><br />
                            <div className="input-group mb-2">
                                <input
                                    type="text"
                                    className="form-control mobile-input text-center"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={handleOtpChange}
                                    maxLength="6"
                                    style={{ background: "transparent", color: "white" }}
                                />
                            </div>
                            {error && <p className="text-danger">{error}</p>}
                            <button type="submit" className="btn w-100 mt-3 continue">Verify OTP</button>
                            <div className="or-divider">
                                <hr /><span>or</span><hr />
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleFinalSubmit}>
                            <h2 className="fw-bold">Welcome Back</h2>
                            <p className="text-white opacity-50">Please Signup To Your Account And Continue Your Shopping</p>
                            <label className="mt-3">Enter Your Name</label><br /><br />
                            <input
                                type="text"
                                className="form-control mb-2 mobile-input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={handleUsernameChange}
                                style={{ background: "transparent", color: "white" }}
                            />
                            {error && <p className="text-danger">{error}</p>}
                            <label className="mt-3">Enter Mobile Number</label><br /><br />
                            <div className="input-group mb-2">
                                <span className="input-group-text mobile-input">+91</span>
                                <input
                                    type="tel"
                                    className="form-control mobile-input"
                                    value={mobileNumber}
                                    readOnly
                                    style={{ background: "transparent", color: "white" }}
                                />
                            </div>
                            <button type="submit" className="btn w-100 mt-3 continue">Proceed</button>
                            <div className="or-divider">
                                <hr /><span>or</span><hr />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;