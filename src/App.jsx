import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/dashboard";
import OnSaleProducts from "./components/OnSaleProducts";
import Newarrival from "./components/Newarrival";
import Mycart from "./components/mycart";
import Profile from "./components/Profile";
import PrivateRoute from "./components/privateRoute";
import CategoryPage from "./views/CategoryPage";

function App() {
    return (
        
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<Login />} />

                {/* Private Routes - Requires Authentication */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/OnSaleProducts" element={<OnSaleProducts />} />
                    <Route path="/dashboard/new-arrivals" element={<Newarrival />} />
                    <Route path="/dashboard/category/:categoryName" element={<CategoryPage />} />
                    <Route path="/dashboard/my-cart" element={<Mycart />} />
                    <Route path="/dashboard/profile" element={<Profile  />} />
                </Route>
            </Routes>
    )
        
};

export default App;
