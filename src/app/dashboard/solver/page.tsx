import {
  isAuthorized,
} from "@/features/auth/server/actions";

export default async function page() {

  await isAuthorized("SOLVER");

  return (
    <div className="flex flex-col w-full h-screen justify-center items-center">
      Solver Dashbaord
    </div>
  );
}
