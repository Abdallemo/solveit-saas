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
import {
  registerFormSchema,
  registerInferedTypes,
} from "../../server/auth-types";
import Link from "next/link";
import FormError from "./loginFormError";
import FormSuccess from "./loginFormSuccess";
import { Loader2 } from "lucide-react";
import SocialButtons from "../../components/socialButtons";

type registerCardProps = {
  myformController: UseFormReturn<registerInferedTypes>;
  submitHandler: (values: z.infer<typeof registerFormSchema>) => Promise<void>;
  isPending:boolean
  error: string;
  success:string
};

export default function RegisterCard({
  myformController,
  submitHandler,
  isPending,
  error,
  success
}: registerCardProps) {
  return (
    <div className="flex flex-col w-100 pt-2 ">
      <div className="text-start mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Get started</h1>
        <p className="mt-2 text-foreground">Create your account in minutes</p>
      </div>
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
                        placeholder="jonh@gmail.com"
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
                        placeholder="******"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <FormSuccess message={success}/>
              <Button className="px-28 py-6 mt-4" variant={"default"} disabled={isPending}>
                {isPending? (<Loader2 className="animate-spin"/>):'Register'}
              </Button>
            </form>
          </Form>
          <div className="flex gap-4 mb-4 w-full items-center mt-5">
            <SocialButtons/>
          </div>
        </CardContent>
        <CardFooter className="flex place-content-center text-foreground">
          <p className="text-sm  ">
            {"Have an account? "}
            <Link className="font-semibold " href={"/login"}>
              Sign In Now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
