import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/dashboard";
import OnSaleProducts from "./components/OnSaleProducts";
import Newarrival from "./components/Newarrival";
import Mycart from "./components/mycart";
import Profile from "./components/Profile";
import PrivateRoute from "./components/privateRoute";
import CategoryPage from "./views/CategoryPage";
import AdminLayout from "./Layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Users from './pages/admin/Users';
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Revenue from "./pages/admin/Revenue";
import Home from "./home/Home";
import UserCategory from './home/UserCategory'
import UserOnsale from "./home/UserOnsale";
import UserNewArrivals from "./home/UserNewArrivals";
import { ToastContainer } from 'react-toastify';

function App() {
    return (
        <>
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/usercategory/:categoryName" element={<UserCategory />} />
                <Route path="/onsaleproducts" element={<UserOnsale />} />
                <Route path="/new-arrivals" element={<UserNewArrivals />} />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="/admin/login" element={<Dashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/products" element={<Products />} />
                    <Route path="/admin/orders" element={<Orders />} />
                    <Route path="/admin/revenue" element={<Revenue />} />
                </Route>

                {/* Private Routes - Requires Authentication */}
                <Route element={<PrivateRoute />} >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/OnSaleProducts" element={<OnSaleProducts />} />
                    <Route path="/dashboard/new-arrivals" element={<Newarrival />} />
                    <Route path="/dashboard/category/:categoryName" element={<CategoryPage />} />
                    <Route path="/dashboard/my-cart" element={<Mycart />} />
                    <Route path="/dashboard/profile" element={<Profile />} />


                </Route>
            </Routes >
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    )

};

export default App;
