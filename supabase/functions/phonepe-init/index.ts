import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 🔥 PHONEPE TEST CREDENTIALS (આ ટેસ્ટિંગ માટે છે)
const MERCHANT_ID = "PGTESTPAYUAT"; 
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const SALT_INDEX = 1;
const PHONEPE_HOST = "https://api-preprod.phonepe.com/apis/pg-sandbox";

serve(async (req) => {
  // CORS Handle
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, mobileNumber } = await req.json()

    // ૧. ટ્રાન્ઝેક્શન ID બનાવો
    const merchantTransactionId = "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const userId = "USER_" + mobileNumber.replace(/\D/g, '').slice(-10);

    // ૨. ડેટા પેકેટ (Payload)
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amount * 100, // પૈસામાં (500 Rs = 50000 paise)
      redirectUrl: "https://google.com", // અત્યારે Google પર જશે
      redirectMode: "REDIRECT",
      callbackUrl: "https://your-project.supabase.co/functions/v1/phonepe-webhook",
      mobileNumber: mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };

    // ૩. એન્ક્રિપ્શન (Base64 + SHA256)
    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64EncodedPayload = bufferObj.toString("base64");

    const stringToHash = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    
    const xVerify = hashHex + "###" + SALT_INDEX;

    // ૪. PhonePe ને મોકલો
    console.log("Sending request to PhonePe...");
    
    const response = await fetch(`${PHONEPE_HOST}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({ request: base64EncodedPayload }),
    });

    const result = await response.json();

    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true,
        url: result.data.instrumentResponse.redirectInfo.url,
        transactionId: merchantTransactionId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      throw new Error(result.message || 'Payment initiation failed');
    }

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})