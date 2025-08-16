"use client";

import { Button } from "@/components/ui/button";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentDialogSkeleton } from "./PaymentSkelton";
import { env } from "@/env/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useCurrentUser from "@/hooks/useCurrentUser";
type CheckoutPageProps = {
  open: boolean;
  setCheckoutOpen: (open: boolean) => void;
  clientSecret: string;
};
export function CheckoutPage({
  open,
  clientSecret,
  setCheckoutOpen,
}: CheckoutPageProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsloading] = useState(false);
  const { user } = useCurrentUser();
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      console.error(submitError);
      return;
    }
    setIsloading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${env.NEXT_PUBLIC_URL}/dashboard/poster/newTask/`,
      },
    });
    setIsloading(false);

    if (error) {
      console.error(error.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setCheckoutOpen}>
      <DialogContent className="w-[520px] max-w-none data-[state=open]:animate-none">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>

        {!clientSecret && <PaymentDialogSkeleton />}

        {clientSecret && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement
              options={{
                defaultValues: {
                  billingDetails: {
                    email: user?.email!,
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="success"
              className="w-full"
              disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Pay
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
