import type { Tone } from "@/lib/mock-data";

export const toneText: Record<Tone, string> = {
  primary: "text-primary",
  yes: "text-yes",
  no: "text-no",
  grape: "text-grape",
  amber: "text-amber",
  teal: "text-teal",
  pinkish: "text-pinkish",
};

export const toneBg: Record<Tone, string> = {
  primary: "bg-primary",
  yes: "bg-yes",
  no: "bg-no",
  grape: "bg-grape",
  amber: "bg-amber",
  teal: "bg-teal",
  pinkish: "bg-pinkish",
};

export const toneSoft: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  yes: "bg-yes-soft text-yes",
  no: "bg-no-soft text-no",
  grape: "bg-grape-soft text-grape",
  amber: "bg-amber-soft text-amber",
  teal: "bg-teal-soft text-teal",
  pinkish: "bg-pinkish-soft text-pinkish",
};

export const toneStroke: Record<Tone, string> = {
  primary: "var(--primary)",
  yes: "var(--yes)",
  no: "var(--no)",
  grape: "var(--grape)",
  amber: "var(--amber)",
  teal: "var(--teal)",
  pinkish: "var(--pinkish)",
};
