import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, TriangleAlert } from "lucide-react";

import { verifyVerificationToken } from "@/features/auth/server/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const token = (await searchParams).token;

  console.log("searchParms " + token);

  const result = await verifyVerificationToken(token);
  console.log({ result: result });
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
            <div className="flex gap-2 text-destructive/50 bg-destructive/15   w-full ">
              <>
                {result.error == "INVALID" ? (
                  <div className="flex p-4 items-center gap-2">
                    <TriangleAlert  className="h-10 w-10"/>
                    <p>
                      <span>Your Verification Has expired. Please </span>
                      <Link href={"/login"} className="font-semibold underline">
                        re-login to continue.
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="flex p-4">
                    <TriangleAlert />
                    <span className="">Invalid Verification</span>
                  </div>
                )}
              </>
            </div>
          )}

          {result?.success == "VERIFIED" && (
            <div className="flex flex-col">
              <div className="flex flex-row">
                <ShieldCheck />
                <p>You have successfully verified your email.</p>
              </div>
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
