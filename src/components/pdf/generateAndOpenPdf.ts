import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { A4PdfDocument } from "./A4PdfDocument";

export type GeneratePdfOptions = {
  title: string;
};

export async function generateAndOpenPdf(options: GeneratePdfOptions) {
  // Let the UI paint the disabled state before doing heavier work.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const instance = pdf(
    createElement(A4PdfDocument, {
      title: options.title,
    })
  );

  const blob = await instance.toBlob();
  const url = URL.createObjectURL(blob);

  // Open in a new tab.
  window.open(url, "_blank", "noopener,noreferrer");

  // Cleanup after some time.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
