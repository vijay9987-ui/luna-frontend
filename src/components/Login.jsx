import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { auth } from "../firebase";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth";

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState("");
    const [error, setError] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState("");
    const [showLogo, setShowLogo] = useState(true);
    const [showLogin, setShowLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(30);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            navigate("/dashboard");
        }

        const timer1 = setTimeout(() => setShowLogo(false), 4000);
        const timer2 = setTimeout(() => setShowLogin(true), 2700);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [navigate]);

    useEffect(() => {
        let interval;
        if (resendDisabled && countdown > 0) {
            interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setResendDisabled(false);
            setCountdown(30);
        }
        return () => clearInterval(interval);
    }, [resendDisabled, countdown]);

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
                    size: 'invisible',
                    callback: (response) => {
                        console.log('reCAPTCHA solved');
                    },
                    'expired-callback': () => {
                        console.log('reCAPTCHA expired');
                    },
                }, auth);
            } catch (error) {
                console.error('Error initializing reCAPTCHA:', error);
            }
        }
    }, []);
    

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) {
            setMobileNumber(value);
            setError("");
            e.target.style.background = "transparent";
            e.target.style.color = "white";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mobileNumber.length !== 10) {
            setError("Enter a valid 10-digit mobile number.");
            return;
        }
    
        setLoading(true);
        try {
            const fullPhone = `+91${mobileNumber}`; // Ensure correct phone format
    
            // Ensure that recaptchaVerifier is correctly initialized
            const appVerifier = window.recaptchaVerifier;
            if (!appVerifier) {
                throw new Error("reCAPTCHA verification is not properly initialized.");
            }
    
            const confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
            window.confirmationResult = confirmation;
            setStep(2);
            setResendDisabled(true);
            setError("");
        } catch (err) {
            console.error("Firebase OTP Error", err);
            setError(err.message || "Failed to send OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };
    

    const handleOtpChange = (e) => {
        setOtp(e.target.value.replace(/\D/g, ""));
        setError("");
        e.target.style.background = "transparent";
        e.target.style.color = "white";
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            await window.confirmationResult.confirm(otp);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
            setStep(3);
            setError("");
        } catch (err) {
            console.error("OTP Verification Failed", err);
            setError("Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (resendDisabled) return;
        
        setResendDisabled(true);
        setCountdown(30);
        setError("");
        setLoading(true);
        
        try {
            await handleSubmit({ preventDefault: () => {} });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setError("");
        e.target.style.background = "transparent";
        e.target.style.color = "white";
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        const usernameRegex = /^[a-zA-Z0-9_]{3,10}$/;
        if (!usernameRegex.test(username)) {
            setError("Username must be 3-10 characters (letters, numbers, underscores)");
            return;
        }

        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100 text-white welcome">
            {showLogo && (
                <div className="logo-animation-container">
                    <img
                        src="https://dcassetcdn.com/design_img/2507971/637258/637258_13453039_2507971_014d29b7_image.png"
                        className="logo-animation"
                        alt="Luna logo"
                    />
                </div>
            )}

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
                            <button
                                type="submit"
                                className="btn w-100 mt-3 continue"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Continue'}
                            </button>
                            <div className="or-divider">
                                <hr /><span>or</span><hr />
                            </div>
                            <div id="recaptcha-container"></div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={verifyOtp}>
                            <h2 className="fw-bold">Welcome Back !</h2>
                            <p className="text-white opacity-100">Please enter the OTP sent to {mobileNumber}. <span
                                style={{ cursor: 'pointer', color: '#0d6efd' }}
                                onClick={() => setStep(1)}
                            >
                                Change
                            </span></p>

                            <div id="recaptcha-container"></div>

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
                            <div className="d-flex justify-content-end mb-3">
                                <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={resendOtp}
                                    disabled={resendDisabled}
                                    style={{ color: resendDisabled ? 'gray' : '#0d6efd' }}
                                >
                                    {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                                </button>
                            </div>
                            {error && <p className="text-danger">{error}</p>}
                            <button
                                type="submit"
                                className="btn w-100 mt-3 continue"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
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
                            <button
                                type="submit"
                                className="btn w-100 mt-3 continue"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed'}
                            </button>
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