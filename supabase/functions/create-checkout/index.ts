import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { cart, customer, origin } = await req.json();

    const orderId = "ORD-" + Date.now().toString(36).toUpperCase();
    const total   = cart.reduce((s: number, i: any) => s + i.price * i.qty, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(item.img ? { images: [item.img] } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      mode: "payment",
      customer_email: customer.email,
      success_url: `${origin}/success.html?order_id=${orderId}`,
      cancel_url:  `${origin}/#shop`,
      metadata: { order_id: orderId },
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("orders").insert([{
      id:                orderId,
      date:              new Date().toISOString(),
      customer_name:     customer.name,
      customer_email:    customer.email,
      customer_address:  customer.address,
      customer_city:     customer.city,
      customer_zip:      customer.zip,
      items:             cart,
      total:             total,
      status:            "pending",
      stripe_session_id: session.id,
    }]);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
