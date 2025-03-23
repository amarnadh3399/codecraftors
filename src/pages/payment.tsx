import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from 'src/integrations/supabase/client';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const [amount, setAmount] = useState<number>(0);
  const [eventId, setEventId] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // ✅ Fetch logged-in user UUID on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error('Please login to continue');
        navigate('/login');
      } else {
        setUserId(user.id); // ✅ Set the valid UUID
      }
    };

    fetchUser();
  }, [navigate]);

  const handlePayment = async () => {
    if (!amount || !eventId) {
      toast.error('Please enter a valid amount and event ID');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from('payments')
      .insert([{ amount, user_id: userId, event_id: eventId }]);

    setLoading(false);

    if (error) {
      console.error('Payment Error:', error);
      toast.error('Payment Failed');
    } else {
      console.log('Payment Success:', data);
      toast.success('Payment Successful!');
      setAmount(0);
      setEventId(0);
      // ✅ Redirect to CheckoutPage
      navigate('/checkout');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl mb-4 font-semibold">Payment Page</h2>

      <input
        type="number"
        placeholder="Enter Amount"
        className="border p-2 w-full mb-4 rounded"
        value={amount || ''}
        onChange={(e) => setAmount(Number(e.target.value))}
        min="1"
      />

      <input
        type="number"
        placeholder="Enter Event ID"
        className="border p-2 w-full mb-4 rounded"
        value={eventId || ''}
        onChange={(e) => setEventId(Number(e.target.value))}
        min="1"
      />

      {/* ✅ User ID is fetched, no manual input */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } text-white px-4 py-2 rounded w-full`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default PaymentPage;
