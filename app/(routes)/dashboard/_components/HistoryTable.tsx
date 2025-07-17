"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SessionDetail } from "../medical-agent/[sessionId]/page";
import moment from "moment";
import ViewReportDialog from "./ViewReportDialog";

type Props = {
  historyList: SessionDetail[];
};

function HistoryTable({ historyList }: Props) {
  return (
    <Table>
      <TableCaption>Previous Consultation Reports</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Doctor</TableHead>
          <TableHead>AI Medical Specilist</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {historyList.map((record: SessionDetail, index: number) => {
          const [relativeDate, setRelativeDate] = useState("");
          useEffect(() => {
            if (typeof window !== "undefined") {
              setRelativeDate(moment(new Date(record.createdOn)).fromNow());
            }
          }, [record.createdOn]);
          return (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {record.selectedDoctor.specialist}
              </TableCell>
              <TableCell>{record.notes}</TableCell>
              <TableCell>
                <span suppressHydrationWarning>{relativeDate}</span>
              </TableCell>
              <TableCell className="text-right">
                <ViewReportDialog record={record} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default HistoryTable;