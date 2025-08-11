import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { verifyVerificationToken } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormError from "@/features/auth/register/components/loginFormError";
import FormSuccess from "@/features/auth/register/components/loginFormSuccess";
import { logger } from "@/lib/logging/winston";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const token = (await searchParams).token;

  const result = await verifyVerificationToken(token);
  logger.info({ result: result });
  return (
    <main className="w-full h-screen flex flex-col place-items-center justify-center text-foreground">
      <Card className="w-[25rem] shadow-md flex flex-col text-center'">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-">
            Email Verification🔐
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          {result?.error && (
            <div className="flex gap-2 w-full ">
              <>
                {result.error == "EXPIRED" ? (
                  <div className="flex w-full flex-col p-4 items-center gap-2">
                    <FormError message="Your Verification Has expired." />
                    <Link href={"/login"} className="font-semibold underline">
                      Please re-login to continue.
                    </Link>
                  </div>
                ) : (
                  <div className="flex w-full flex-col p-4 items-center gap-2">
                    <FormError message="Invalid Verification." />
                    {/* <Link href={"/login"} className="font-semibold underline">
                      Please re-login to continue.
                    </Link> */}
                  </div>
                )}
              </>
            </div>
          )}

          {result?.success == "VERIFIED" && (
            <div className="flex flex-col w-full">
              <FormSuccess message="You have successfully verified your email." />
              <Button asChild variant={"link"}>
                <Link href={"/dashboard"}>Login Again</Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </main>
  );
}
