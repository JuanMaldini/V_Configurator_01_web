import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { getBasePdfSections, type PdfSection } from "./pdfTextBases";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  body: {
    fontSize: 12,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 10,
  },
});

type A4PdfDocumentProps = {
  title: string;
  sections?: PdfSection[];
};

export function A4PdfDocument({ title, sections }: A4PdfDocumentProps) {
  const resolvedSections = sections ?? getBasePdfSections();

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.title}>{title}</Text>
        </View>

        {resolvedSections.map((section) => (
          <View key={section.heading} style={pdfStyles.section}>
            <Text style={pdfStyles.body}>{section.heading}</Text>
            {section.lines.map((line, idx) => (
              <Text key={`${section.heading}-${idx}`} style={pdfStyles.body}>
                {line}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export type GeneratePdfOptions = {
  title: string;
  sections?: PdfSection[];
};

export async function generateAndOpenPdf(options: GeneratePdfOptions) {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const instance = pdf(
    createElement(A4PdfDocument, {
      title: options.title,
      sections: options.sections,
    })
  );

  const blob = await instance.toBlob();
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank", "noopener,noreferrer");

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

let isGeneratingPdf = false;

function pickStringField(message: unknown, keys: string[]): string | undefined {
  if (!message || typeof message !== "object") return undefined;
  const obj = message as Record<string, unknown>;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

function pickSectionsField(message: unknown): PdfSection[] | undefined {
  if (!message || typeof message !== "object") return undefined;
  const obj = message as Record<string, unknown>;
  const raw = obj.sections ?? obj.pdfSections ?? obj.content;
  if (!Array.isArray(raw)) return undefined;

  const parsed: PdfSection[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const section = item as Record<string, unknown>;
    const heading = typeof section.heading === "string" ? section.heading : undefined;
    const lines = Array.isArray(section.lines)
      ? section.lines.filter((l): l is string => typeof l === "string")
      : undefined;
    if (!heading || !lines) continue;
    parsed.push({ heading, lines });
  }

  return parsed.length > 0 ? parsed : undefined;
}

async function handleMakePdf(message?: unknown) {
  if (isGeneratingPdf) return;
  isGeneratingPdf = true;
  try {
    const title =
      pickStringField(message, ["title", "pdfTitle", "name"]) ??
      "Configurator Export (A4)";
    const sections = pickSectionsField(message);

    await generateAndOpenPdf({
      title,
      sections,
    });
  } finally {
    isGeneratingPdf = false;
  }
}

export const e3dsPdfCommandHandlers = {
  makepdf: handleMakePdf,
};
