
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import User from './dashboards/User';
import AiTracker from './dashboards/AiTracker';
import MealPlan from './dashboards/MealPlan';
import Consultations from './dashboards/Consultations';
import Profile from './dashboards/Profile';
import Nutritionist from './dashboards/Nutritionist';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Payment from './pages/Payment';
import PaymentSuccess from './pages/Paymentsuccess';
import PaymentCancel from './pages/Paymentcancel';
import { useAuth } from './services/useAuth';
import AdminDashboard from "./dashboards/AdminDashboard";
import About from './pages/About';
import Blogs from './pages/Blogs';
import Messages from './pages/Messages';


function App() {
  useAuth();
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/User" element={<User />} />
        <Route path="/AiTracker" element={<AiTracker />} />
        <Route path="/MealPlan" element={<MealPlan />} />
        <Route path="/Consultations" element={<Consultations />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/nutritionist" element={<Nutritionist />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;