import { Button } from "@/components/ui/button";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

export default function SocialButtons({ isPending }: { isPending: boolean }) {
  return (
    <>
      <Button
        className="py-6 flex-1"
        variant={"outline"}
        disabled={isPending}
        onClick={() => signIn("github")}>
        <FaGithub />
      </Button>
      <Button
        variant={"outline"}
        className="py-6 flex-1"
        disabled={isPending}
        onClick={() => signIn("google")}>
        <FcGoogle />
      </Button>
    </>
  );
}
