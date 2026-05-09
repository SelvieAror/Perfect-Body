import { Link } from 'react-router-dom';

export default function PaymentCancel() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>❌ Payment Cancelled</h1>
      <p>Your subscription was not processed.</p>
      <Link to="/payment">Try Again</Link>
    </div>
  );
}