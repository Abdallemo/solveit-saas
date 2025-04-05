"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EmailRegisterAction } from "@/features/auth/server/actions";
import { useState, useTransition } from "react";
import {
  registerFormSchema,
  registerInferedTypes,
} from "@/features/auth/server/auth-types";
import RegisterCard from "@/features/auth/register/components/regsiterCard";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
export default function Register() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const submitHandler = async (values: registerInferedTypes) => {
    startTransition(async () => {
      setError("");
      setSuccess("");

      myformController.reset();
      try {
        const { error, success } = await EmailRegisterAction(values);

        if (error) setError(error);
        if (success) setSuccess(success);

      } catch (error) {
        console.log(error)
      }

      
    });
  };

  const myformController = useForm<registerInferedTypes>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  return (
   
      <div className="flex w-full h-screen ">
        <div className="flex bg-neutral-100 w-full h-screen place-content-center items-center">
          <RegisterCard
            myformController={myformController}
            submitHandler={submitHandler}
            isPending={isPending}
            error={error}
            success={success}
          />
        </div>
        <BackgroundGradientAnimation>
          <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl"></div>
        </BackgroundGradientAnimation>
      </div>
    
  );
}
