import { supabase } from '../supabaseClient';

export const checkPremiumStatus = async () => {
  try {
    // 1. યુઝરનો ફોન નંબર મેળવો
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false; // લોગિન નથી તો એડ્સ બતાવો

    const userPhone = user.user_metadata?.mobile || user.phone;
    if (!userPhone) return false;

    // 2. છેલ્લું પેમેન્ટ શોધો (સૌથી નવું હોય તે)
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_phone', userPhone)
      .order('created_at', { ascending: false }) // છેલ્લું પેમેન્ટ પહેલા આવશે
      .limit(1);

    if (error || !payments || payments.length === 0) {
      return false; // કોઈ પેમેન્ટ નથી મળ્યું -> એડ્સ બતાવો
    }

    const lastPayment = payments[0];
    const paymentDate = new Date(lastPayment.created_at);
    const planType = lastPayment.plan; // 'Monthly' or 'Yearly'

    // 3. વેલીડીટી ગણો (Validity Calculation)
    let expiryDate = new Date(paymentDate);

    if (planType === 'Monthly' || planType === 'માસિક સહયોગ') {
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 દિવસ ઉમેરો
    } else if (planType === 'Yearly' || planType === 'વાર્ષિક સહયોગ') {
      expiryDate.setDate(expiryDate.getDate() + 365); // 365 દિવસ ઉમેરો
    }

    // 4. તારીખ સરખાવો (આજે વેલીડીટી બાકી છે?)
    const today = new Date();
    
    if (today < expiryDate) {
      return true; // ✅ વેલીડીટી બાકી છે -> એડ્સ બંધ કરો
    } else {
      return false; // ❌ પૂરું થઈ ગયું છે -> એડ્સ બતાવો
    }

  } catch (err) {
    console.log("Error checking premium:", err);
    return false;
  }
};