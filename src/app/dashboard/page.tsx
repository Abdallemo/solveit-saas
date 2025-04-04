import { auth } from "@/lib/auth";

export default async function page() {
  const session = await auth();

  return (
    <>
      <h1 className="text-green-700 text-6xl text-center">Succsseeded</h1>

      <p>{JSON.stringify(session)}</p>
    </>
  );
}
