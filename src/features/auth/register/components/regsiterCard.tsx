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
import { registerFormSchema, registerInferedTypes } from "../../server/auth-types";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { GithubSignInAction, GooogleSignInAction } from "../../server/actions";
import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import RegisterFormError from "./loginFormError";

type registerCardProps = {
  myformController: UseFormReturn<registerInferedTypes>;
  submitHandler: (values: z.infer<typeof registerFormSchema>) => Promise<void>;
  setLoadingState: Dispatch<SetStateAction<boolean>>;
  error:string
};

export default function RegisterCard({
  myformController,
  submitHandler,
  setLoadingState,
  error,
}: registerCardProps) {
  return (
    <div className="flex flex-col w-100 pt-2 ">
        <p className="text-2xl text-foreground font-sans font-semibold py-10">Get started</p>
    <Card className="">
      <CardContent>
        <Form {...myformController}>
          <form
            onSubmit={myformController.handleSubmit(submitHandler)}
            className="flex flex-col  gap-2 ">
            <FormField
              control={myformController.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
              <FormField
                control={myformController.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={myformController.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <RegisterFormError message={error}/>
            <Button className="px-28 py-6 mt-4" variant={"default"}>Login</Button>
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
      <p className="text-sm text-neutral-700 ">{"Have an account? "}<Link className="font-semibold " href={'/login'}>Sign In Now</Link></p>
      </CardFooter>
    </Card>
    </div>
  );
}
