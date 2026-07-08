import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import CategorySelection from './pages/CategorySelection';
import ChoosePlan from './pages/ChoosePlan';
import AddonsSelection from './pages/AddonsSelection';
import TravelerDetails from './pages/TravelerDetails';
import ReviewSummary from './pages/ReviewSummary';
import PolicySuccess from './pages/PolicySuccess';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import EndorsePolicy from './pages/EndorsePolicy';
import EndorseSuccess from './pages/EndorseSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CategorySelection />} />
        <Route path="/choose-plan" element={<ChoosePlan />} />
        <Route path="/addons" element={<AddonsSelection />} />
        <Route path="/traveler-details" element={<TravelerDetails />} />
        <Route path="/review-summary" element={<ReviewSummary />} />
        <Route path="/policy-success" element={<PolicySuccess />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
        <Route path="/endorse-policy" element={<EndorsePolicy />} />
        <Route path="/endorse-success" element={<EndorseSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
