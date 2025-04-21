import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/dashboard";
import Mostwanted from "./components/Mostwanted";
import Newarrival from "./components/Newarrival";
import Mycart from "./components/mycart";
import Profile from "./components/Profile";
import PrivateRoute from "./components/privateRoute";

function App() {
    return (
        
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<Login />} />

                {/* Private Routes - Requires Authentication */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/most-wanted" element={<Mostwanted />} />
                    <Route path="/dashboard/new-arrivals" element={<Newarrival />} />
                    <Route path="/dashboard/my-cart" element={<Mycart />} />
                    <Route path="/dashboard/profile" element={<Profile  />} />
                </Route>
            </Routes>
    )
        
};

export default App;
