"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/contex/UserDetailContex';

export type UsersDetail ={
  name:string,
  email:string,
  credits:number
}

function provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
    const {user}=useUser();
    const [userDetail,setUserDetail]=useState<any>();
    useEffect(()=>{
        user&&CreateNewUser();
    }, [user])
     

const CreateNewUser = async() =>{
    const result=await axios.post('/api/users');
    console.log(result.data)
    setUserDetail(result.data);
}

  return (
    <div>
      <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
      {children}
      </UserDetailContext.Provider>
    </div>
  )
}

export default provider 