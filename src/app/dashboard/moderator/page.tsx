import { isAuthorized } from "@/features/auth/server/actions"

export default async function page() {
 await isAuthorized('MODERATOR')
  
  return (
    <div>Moderator Dashbaord</div>
  )
}

