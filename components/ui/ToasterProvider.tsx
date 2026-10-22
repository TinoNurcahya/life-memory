"use client";

import { Toaster } from "sonner";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      theme="system"
      richColors
      closeButton
      toastOptions={{
        className: "font-sans border border-canvas-subtle/40 backdrop-blur-md shadow-lg",
        duration: 3500,
      }}
    />
  );
}
