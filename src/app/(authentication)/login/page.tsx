'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { EmailSignInAction} from '@/features/auth/server/actions'
import { useState } from "react"
import LoginLoader from "@/components/myLoadingComp"
import LoginCard from "@/features/auth/login/components/LoginCard"
import { loginFormSchema, loginInferedTypes } from "@/features/auth/server/auth-types"
export default function Login() {
  const [isInLoadingState, setLoadingState] = useState(false);

  const submitHandler = async (values: loginInferedTypes) => {
    console.log(values);
    myformController.reset();
    setLoadingState(true);
    EmailSignInAction(values);
  };


  const myformController = useForm<loginInferedTypes>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  return (
    <LoginLoader isLoading={isInLoadingState}>

      <div className="flex w-full h-screen ">
      <div className="flex bg-neutral-100 w-1/2 h-screen place-content-center items-center"> 
      
      <LoginCard myformController={myformController} submitHandler={submitHandler}  setLoadingState={setLoadingState}/>

      </div>
      <div className="bg-neutral-900 w-full h-screen"> </div>
      </div>

    </LoginLoader>
  )
}
