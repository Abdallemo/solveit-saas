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
import Logo from "@/components/marketing/logo";
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
        clientLogger("error","unable to register",{error:error})
        console.log(error);
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
      <div className="flex bg-sidebar w-full h-screen justify-center items-center relative">
        <div className="absolute top-6 left-6">
          <Logo />
        </div>

        <RegisterCard
          myformController={myformController}
          submitHandler={submitHandler}
          isPending={isPending}
          error={error}
          success={success}
        />
      </div>
      <div className=" inset-0 md:flex items-center justify-center text-white  bg-primary font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl w-full hidden"></div>
    </div>
  );
}
