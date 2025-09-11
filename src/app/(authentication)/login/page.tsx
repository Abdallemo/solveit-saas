"use client";

import Logo from "@/components/marketing/logo";
import FeaturePanelWithAnimation from "@/features/auth/components/feature-panel";
import LoginCard from "@/features/auth/login/components/LoginCard";
import { EmailSignInAction } from "@/features/auth/server/actions";
import {
  loginFormSchema,
  loginInferedTypes,
} from "@/features/auth/server/auth-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

export default function Login() {
  const searchParms = useSearchParams();
  const oAuthConflictError =
    searchParms.get("error") === "OAuthAccountNotLinked"
      ? "Email already in Use with different provider"
      : "";

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
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
      <div className="relative  w-full h-screen flex  justify-center items-center">
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

      <div className="inset-0 md:flex items-center justify-center w-full hidden">
        <FeaturePanelWithAnimation />
      </div>
    </div>
  );
}
