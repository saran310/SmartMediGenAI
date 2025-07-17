"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import axios from "axios";
import HistoryTable from "./HistoryTable";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import AddNewSessionDialog from "./AddNewSessionDialog";

const HistoryList = () => {
  const [historyList, setHistoryList] = React.useState<SessionDetail[]>([]);

  React.useEffect(() => {
    GetHistoryList();
  }, []);

  const GetHistoryList = async () => {
    const result = await axios.get("/api/session-chat?sessionId=all");
    setHistoryList(result.data);
    console.log(result.data);
  };
  return (
    <div className="mt-10">
      {historyList.length == 0 ? (
        <div className="flex-col flex justify-center items-center gap-4 border-dashed rounded-2xl border-2 border p-9">
          <Image
            src="/medical-assistance.png"
            alt="No History"
            width={200}
            height={200}
          />
          <h2 className="font-bold text-xl mt-2">No Recent Consultation</h2>
          <p>It Look Like you haven't consulting eith any doctors yet</p>
          <AddNewSessionDialog />
        </div>
      ) : (
        <div>
          <HistoryTable historyList={historyList} />
        </div>
      )}
    </div>
  );
};

export default HistoryList;
