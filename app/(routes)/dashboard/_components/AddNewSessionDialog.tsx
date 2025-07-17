"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import { doctorAgent } from "./DoctorAgentCard";
import SuggestedDoctorCard from "./SuggestedDoctorCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import { toast } from "sonner";

function AddNewSessionDialog() {
  const [note, setNote] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>();
  const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>();
  const [historyList, setHistoryList] = useState<SessionDetail[]>([]);
  const router = useRouter();

  const { has } = useAuth();
  //@ts-ignore
  const paidUser = has && has({ plan: "pro" });

  useEffect(() => {
    GetHistoryList();
  }, []);

  const GetHistoryList = async () => {
    const result = await axios.get("/api/session-chat?sessionId=all");
    setHistoryList(result.data);
  };

  const OnClickNext = async () => {
    try {
      setLoading(true);
      const result = await axios.post("/api/suggest-doctors", {
        notes: note,
      });
      setSuggestedDoctors(result.data);
    } catch (err: any) {
      if (err?.response?.data?.error) {
        toast.error(
          "There was an error with the AI services. " + err.response.data.error
        );
      } else {
        toast.error(
          "An error occurred in the AI services. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const onStartConsultation = async () => {
    setLoading(true);
    try {
      await axios.post("/api/users");
      const result = await axios.post("/api/session-chat", {
        notes: note,
        selectedDoctor: selectedDoctor,
      });
      if (result.data?.sessionId) {
        router.push("/dashboard/medical-agent/" + result.data.sessionId);
      }
    } catch (err: any) {
      if (err?.response?.data?.error) {
        toast.error(
          "There was an error with the AI services. " + err.response.data.error
        );
      } else {
        toast.error(
          "An error occurred in the AI services. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="mt-3 cursor-pointer"
          disabled={!paidUser && historyList?.length >= 1}
        >
          + Start a Consultation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription asChild>
            {!suggestedDoctors ? (
              <div>
                <h2>Add Symptoms or Anny Other Details</h2>
                <Textarea
                  className="h-[200px] mt-1"
                  placeholder="Add Detail here"
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <h2>Select the doctor</h2>
                <div className="grid grid-cols-3 gap-5">
                  {suggestedDoctors.map((doctor) => (
                    <SuggestedDoctorCard
                      doctorAgent={doctor}
                      setSelectedDoctor={() => setSelectedDoctor(doctor)}
                      //@ts-ignore
                      selectedDoctor={selectedDoctor}
                      key={doctor.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>

          {!suggestedDoctors ? (
            <Button disabled={!note || loading} onClick={() => OnClickNext()}>
              Next{" "}
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
          ) : (
            <Button
              disabled={loading || !selectedDoctor}
              onClick={() => onStartConsultation()}
            >
              Start Consultation
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;