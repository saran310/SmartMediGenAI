import React from 'react'
import { doctorAgent } from './DoctorAgentCard';
import Image from 'next/image';
import { Button } from '@/components/ui/button';


type Props = {
    doctorAgent: doctorAgent;
    setSelectedDoctor:any;
    selectedDoctor: doctorAgent | undefined;
}
const SuggestedDoctorCard = ({ doctorAgent , setSelectedDoctor, selectedDoctor }: Props) => {
  return (
    <div className={`flex flex-col items-center justify-between border rounded-2xl shadow p-5 hover:border-blue-500 transition-all duration-200 ease-in-out cursor-pointer
    ${selectedDoctor && selectedDoctor?.id == doctorAgent?.id && 'border-blue-500'}
    `} onClick={() => setSelectedDoctor(doctorAgent)}>
      <Image
        src={doctorAgent?.image}
        alt={doctorAgent?.specialist}
        width={80}
        height={80}
        className="rounded-4xl mb-4 w-[80px] h-[80px] object-cover"/>
        <h2 className="font-bold mb-2">{doctorAgent?.specialist}</h2>
        <p className="text-sm mb-4 line-clamp-2 mt-1">{doctorAgent?.description}</p>
        
    </div>
  )
}

export default SuggestedDoctorCard