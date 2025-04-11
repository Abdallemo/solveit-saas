import { isAuthorized } from "@/features/auth/server/actions"

export  default async function page() {
   await isAuthorized('SOLVER')
  
  return (
    <div>Solver Dashbaord
      


    </div>
  )
}

