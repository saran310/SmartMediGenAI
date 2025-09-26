"use client";
import React, { useState } from "react";
import Tesseract from "tesseract.js";

export default function OCRExtractor() {
  const [ocrText, setOcrText] = useState<string>("");

  // Function to process only required fields
  const extractRelevantInfo = (text: string) => {
    let chiefComplaint = "";
    let duration = "";
    let severity = "";
    let medications: string[] = [];

    // Example regex/keywords - you can refine as per your prescription format
    const complaintMatch = text.match(/chief complaint[:\-]?\s*(.*)/i);
    if (complaintMatch) chiefComplaint = complaintMatch[1];

    const durationMatch = text.match(/duration[:\-]?\s*(.*)/i);
    if (durationMatch) duration = durationMatch[1];

    const severityMatch = text.match(/severity[:\-]?\s*(.*)/i);
    if (severityMatch) severity = severityMatch[1];

    // Medications - assume lines starting with a medicine name pattern
    const medMatches = text.match(/(Tab|Cap|Inj|Syrup)\s+[A-Za-z0-9]+/g);
    if (medMatches) medications = medMatches;

    return {
      chiefComplaint,
      duration,
      severity,
      medications,
    };
  };

  const extractOCR = async (file: File) => {
    const { data: { text } } = await Tesseract.recognize(file, "eng");

    // Filter only required info
    const result = extractRelevantInfo(text);

    let finalOutput = "";
    if (result.chiefComplaint) finalOutput += `🩺 Chief Complaint: ${result.chiefComplaint}\n`;
    if (result.duration) finalOutput += `⏳ Duration: ${result.duration}\n`;
    if (result.severity) finalOutput += `⚡ Severity: ${result.severity}\n`;
    if (result.medications.length > 0) finalOutput += `💊 Medications: ${result.medications.join(", ")}\n`;

    setOcrText(finalOutput || "⚠️ No relevant info found.");
  };

  return (
    <div className="mt-3">
      <label className="block text-sm">📷 Upload Prescription (OCR)</label>
      <input type="file" onChange={e => e.target.files && extractOCR(e.target.files[0])} />
      {ocrText && <pre className="text-sm mt-1 whitespace-pre-wrap">📝 {ocrText}</pre>}
    </div>
  );
}
