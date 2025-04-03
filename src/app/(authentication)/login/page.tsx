'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { EmailSignInAction} from '@/features/auth/server/actions'
import { useState } from "react"
import LoginLoader from "@/components/myLoadingComp"
import LoginCard from "@/features/auth/login/components/LoginCard"
import { loginFormSchema, loginInferedTypes } from "@/features/auth/server/auth-types"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
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
      <div className="flex bg-neutral-100 w-full h-screen place-content-center items-center"> 
      
      <LoginCard myformController={myformController} submitHandler={submitHandler}  setLoadingState={setLoadingState}/>

      </div>
      <BackgroundGradientAnimation>
      <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">

      </div>
    </BackgroundGradientAnimation>
      </div>

    </LoginLoader>
  )
}
