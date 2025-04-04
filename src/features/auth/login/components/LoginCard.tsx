import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { loginFormSchema, loginInferedTypes } from "../../server/auth-types";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GithubSignInAction, GooogleSignInAction } from "../../server/actions";
import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import FormError from "../../register/components/loginFormError";
import FormSuccess from "../../register/components/loginFormSuccess";

type LoginCardProps = {
  myformController: UseFormReturn<loginInferedTypes>;
  submitHandler: (values: z.infer<typeof loginFormSchema>) => Promise<void>;
  setLoadingState: Dispatch<SetStateAction<boolean>>;
  error: string;
  success: string;
};

export default function LoginCard({
  myformController,
  submitHandler,
  setLoadingState,
  error,
  success,
}: LoginCardProps) {
  return (
    <div className="flex flex-col w-100 pt-2 ">
      <p className="text-2xl text-foreground font-sans font-semibold py-10">
        Welcome Back
      </p>
      <Card className="flex gap-4">
        <CardContent>
          <Form {...myformController}>
            <form
              onSubmit={myformController.handleSubmit(submitHandler)}
              className="flex flex-col  gap-4 ">
              <FormField
                control={myformController.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="jonh@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {
                <FormField
                  control={myformController.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              }
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button className="px-28 py-6 mt-4" variant={"default"}>
                Login
              </Button>
            </form>
          </Form>
          <div className="flex gap-4 mb-4 w-full items-center mt-5">
            <Button
              className="py-6 flex-1"
              variant={"outline"}
              onClick={async () => {
                setLoadingState(true);
                try {
                  await GithubSignInAction();
                } catch (error) {
                  console.log(error);
                }
              }}>
              <FaGithub />
            </Button>
            <Button
              variant={"outline"}
              className="py-6 flex-1"
              onClick={async () => {
                setLoadingState(true);
                try {
                  await GooogleSignInAction();
                } catch (error) {
                  console.log(error);
                }
              }}>
              <FcGoogle />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex place-content-center">
          <p className="text-sm text-neutral-700 ">
            {"Don't have an account? "}
            <Link className="font-semibold " href={"/register"}>
              Sign Up Now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
