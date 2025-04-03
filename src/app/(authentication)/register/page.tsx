"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EmailRegisterAction } from "@/features/auth/server/actions";
import { useState } from "react";
import LoginLoader from "@/components/myLoadingComp";
import {
  registerFormSchema,
  registerInferedTypes,
} from "@/features/auth/server/auth-types";
import RegisterCard from "@/features/auth/register/components/regsiterCard";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
export default function Register() {
  const [isInLoadingState, setLoadingState] = useState(false);
  const [error, setError] = useState<string>("");

  const submitHandler = async (values: registerInferedTypes) => {
    console.log(values);
    myformController.reset();
    setLoadingState(true);
    const { error } = await EmailRegisterAction(values);

    setError(error);
    if (error) {
      setLoadingState(false);
    }
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
    <LoginLoader isLoading={isInLoadingState}>
      <div className="flex w-full h-screen ">
        <div className="flex bg-neutral-100 w-full h-screen place-content-center items-center">
          <RegisterCard
            myformController={myformController}
            submitHandler={submitHandler}
            setLoadingState={setLoadingState}
            error={error}
          />
        </div>
        <BackgroundGradientAnimation>
          <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl"></div>
        </BackgroundGradientAnimation>
      </div>
    </LoginLoader>
  );
}
