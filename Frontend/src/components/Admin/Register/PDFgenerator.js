import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../../assets/logo.jpg";

export const REQUIRED_FIELDS = [
  "studentID",
  "dateOfLeaving",
  "dateOfAdmission",
  "progressAndConduct","fatherName", "motherName", "caste", "subCaste", "nationality", 
  "placeOfBirth", "dateOfBirth", "dobWords", "branch", "yearOfAdmission", 
  "admissionMode", "lastCollege", "reasonForLeaving"
];

export const generatePDF = (studentData, formData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ==== HEADER ====
  // Logo (top right)
  const imgWidth = 25;
  const imgHeight = 25;
  const x = pageWidth - margin - imgWidth;
  const y = margin + 5;
  const textSpacing = 8;
  doc.addImage(logo, "JPEG", x, y, imgWidth, imgHeight);

  // Small top-left text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Indira College of Engineering & Management", margin, margin);

  //upper line
  doc.setLineWidth(0.3);
  doc.line(margin, margin + 1, pageWidth - margin, margin + 1);

  // Small top-right text above logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("A211", margin + 171, margin);

  // Center heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  doc.text(
    "Shree Chanakya Education Society's",
    pageWidth / 2 - textSpacing,
    margin + 10,
    {
      align: "center",
    }
  );

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    "INDIRA COLLEGE OF ENGINEERING AND MANAGEMENT",
    pageWidth / 2 - textSpacing,
    margin + 16,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "Survey No.64 & 65, Gat No. 276, At. Parandwadi, Tal. Maval, Dist. Pune-410 506",
    pageWidth / 2 - textSpacing,
    margin + 22,
    { align: "center" }
  );
  doc.setFontSize(8);
  doc.text(
    "Approved by AICTE, New Delhi, DTE(MS) and affiliated to Savitribai Phule Pune University",
    pageWidth / 2 - textSpacing,
    margin + 26,
    { align: "center" }
  );
  doc.text(
    "Id No. :PU/PN/Engg./282/2007",
    pageWidth / 2 - textSpacing,
    margin + 30,
    { align: "center" }
  );

  // Horizontal line
  doc.setLineWidth(0.3);
  doc.line(margin, margin + 35, pageWidth - margin, margin + 35);

  // Ref & Certificate No.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    `Ref: ${formData.refNo || "ICEM/Registrar/TC/2025/ ____"}`,
    margin + 10,
    margin + 38
  );

  //Form no
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("No:", pageWidth - margin - 27, margin + 50);

  // Draw box for certificate number
  const boxWidth = 20;
  const boxHeight = 7;
  const boxX = pageWidth - margin - boxWidth; // aligned near right margin
  const boxY = margin + 45;

  // Rectangle
  doc.rect(boxX, boxY, boxWidth, boxHeight);

  // Certificate number inside the box (bold, centered)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    formData.certificateNo || "____",
    boxX + boxWidth / 2,
    boxY + boxHeight - 2,
    { align: "center" }
  );

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  // Text
  const titleText = "TRANSFER CERTIFICATE";
  const titleY = margin + 45;

  doc.text(titleText, pageWidth / 2, titleY, { align: "center" });

  // Underline
  const textWidth = doc.getTextWidth(titleText);
  const startX = pageWidth / 2 - textWidth / 2;
  const endX = pageWidth / 2 + textWidth / 2;
  doc.setLineWidth(0.2);
  doc.line(startX, titleY + 1, endX, titleY + 1);

  // Note line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "[No change in any entry in this certificate should be made except by the authority issuing it and infringement to the rule",
    pageWidth / 2,
    margin + 67,
    { align: "center" }
  );
  doc.text("will be punished with rustication]", pageWidth / 2, margin + 70, {
    align: "center",
  });

  // ==== TABLE ====
  const tableColumns = ["", "", ""];
  const tableRows = [
    ["Sr.", "Student", formData.studentID || ""],
    ["1", "Name of the Student in Full", studentData.studentName || ""],
    ["2", "Father's Name", formData.fatherName || ""],
    ["3", "Mother's Name", formData.motherName || ""],
    [
      "4",
      "Caste & Sub-caste only in the case of Student belonging to Backward Classes & Category among Backward Classes",
      `${formData.caste || ""} ${formData.subCaste || ""}`,
    ],
    ["5", "Nationality", formData.nationality || ""],
    ["6", "Place of Birth", formData.placeOfBirth || ""],
    ["7", "Date of Birth", formData.dateOfBirth || ""],
    ["8", "Date of Birth in Words", formData.dobWords || ""],
    ["9", "Last College attended", formData.lastCollege || ""],
    ["10", "Date of Admission", formData.dateOfAdmission || ""],
    ["11", "Progress & Conduct", formData.progressAndConduct || ""],
    ["12", "Date of Leaving College", formData.dateOfLeaving || ""],
    ["13", "Year in which studying & since when", formData.yearAndBranch || ""],
    ["14", "Reason for Leaving College", formData.reasonForLeaving || ""],
    ["15", "Remarks", formData.remarks || "_______"],
  ];

  autoTable(doc, {
    startY: margin + 70,
    head: [tableColumns],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 12 }, // Sr. No
      1: { cellWidth: 75 }, // Particulars
      2: { cellWidth: 95, fontStyle: "bold" }, // ✅ Details column bold
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    margin: { left: margin, right: margin },
  });

  // ==== FOOTER ====
  const finalY = doc.lastAutoTable.finalY + 10;

  // Certified line
  doc.setFontSize(8);
  doc.text(
    "* Certified that the above information is in accordance with the college register.",
    margin,
    finalY - 5
  );

  // Prepared & Issued Dates
  const preparedDate =
    formData.preparedDate ||
    new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const issuedDate = formData.issuedDate || "______________";

  doc.setFontSize(8);
  doc.text(`Prepared Date: ${preparedDate}`, margin, finalY + 15);
  doc.text(`Issued Date: ${issuedDate}`, pageWidth - margin - 50, finalY + 15);

  // Signatures section
  const footerY = pageHeight - 35;
  doc.setFontSize(9);

  doc.text("Prepared By", margin + 2, footerY);
  doc.text("Checked By", pageWidth / 2 - 17, footerY);
  doc.text("Principal", pageWidth - margin - 32, footerY);

  // Names below
  doc.setFontSize(9);
  doc.text("Miss. Priyanka Shingude", margin, footerY + 20);
  doc.text("Dr. Anita Surve", pageWidth / 2 - 18, footerY + 20);
  doc.text("Dr. Nilesh Uke", pageWidth - margin - 35, footerY + 20);

  return doc;
};
