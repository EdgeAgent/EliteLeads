import React, { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface CreditPayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  credits: number;
  onSuccess: (orderId: string, credits: number) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export default function CreditPayPalButton({
  amount,
  currency,
  intent,
  credits,
  onSuccess,
  onError,
  onCancel,
}: CreditPayPalButtonProps) {
  const createOrder = async () => {
    const orderPayload = {
      amount: amount,
      currency: currency,
      intent: intent,
    };
    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  };

  const onApprove = async (data: any) => {
    try {
      console.log("onApprove", data);
      const orderData = await captureOrder(data.orderId);
      console.log("Capture result", orderData);
      
      // Call the success callback with order ID and credits
      onSuccess(data.orderId, credits);
    } catch (error) {
      console.error("Payment capture failed:", error);
      onError(error);
    }
  };

  const onCancelHandler = async (data: any) => {
    console.log("onCancel", data);
    onCancel();
  };

  const onErrorHandler = async (data: any) => {
    console.log("onError", data);
    onError(data);
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        onError(e);
      }
    };

    loadPayPalSDK();
  }, []);

  const initPayPal = async () => {
    try {
      const clientToken: string = await fetch("/paypal/setup")
        .then((res) => res.json())
        .then((data) => {
          return data.clientToken;
        });
      
      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel: onCancelHandler,
        onError: onErrorHandler,
      });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
          onError(e);
        }
      };

      const paypalButton = document.getElementById("credit-paypal-button");

      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error(e);
      onError(e);
    }
  };

  return <paypal-button id="credit-paypal-button" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer border-none">Pay with PayPal</paypal-button>;
}