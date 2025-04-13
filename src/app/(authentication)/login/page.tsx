"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { EmailSignInAction } from "@/features/auth/server/actions";
import { useState, useTransition } from "react";
import LoginCard from "@/features/auth/login/components/LoginCard";
import {
  loginFormSchema,
  loginInferedTypes,
} from "@/features/auth/server/auth-types";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/marketing/logo";
import { signIn } from "next-auth/react";

export default function Login() {
  const searchParms = useSearchParams();
  const oAuthConflictError =
    searchParms.get("error") === "OAuthAccountNotLinked"
      ? "Email already in Use with different provider"
      : "";

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter()
  const submitHandler = async (values: loginInferedTypes) => {
    startTransition(async () => {
      setError("");
      setSuccess("");

      myformController.reset();

      const { error, success } = await EmailSignInAction(values);

      if (error) return setError(error);
      if (success && success !== "OK") return setSuccess(success); 
  
      
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
  
      if (res?.error) {
        setError("Login failed: " + res.error);
      } else {
        router.push("/dashboard");
      }
    ;
    });
  };

  const myformController = useForm<loginInferedTypes>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
   
      <div className="flex w-full h-screen ">
        <div className="relative bg-sidebar w-full h-screen flex  justify-center items-center">
          <div className=" absolute top-6 left-6">
            <Logo />
          </div>

          <LoginCard
            myformController={myformController}
            submitHandler={submitHandler}
            error={error || oAuthConflictError}
            success={success}
            isPending={isPending}
          />
        </div>

        <div className=" inset-0 md:flex items-center justify-center text-white  bg-primary font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl w-full hidden"></div>
      </div>
   
  );
}
