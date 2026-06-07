"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useServiceModal,
  type ServiceDetail,
} from "@/components/ServiceDetailModal";

/**
 * Footer-wide service modal. The footer links to several service pages that no
 * longer exist as standalone pages — on `/services` they're rendered as a
 * fullscreen detail modal. This provider owns a single `useServiceModal`
 * instance for the whole footer so any footer link can open that same modal,
 * and renders the modal portal once. Links reach it through `useFooterModal`.
 *
 * When `services` is empty (the service set failed to load) the context simply
 * never resolves an index, so every footer link stays a plain link.
 */

interface FooterModalContextValue {
  open: (i: number) => void;
  setTriggerRef: (i: number) => (el: HTMLElement | null) => void;
}

const FooterModalContext = createContext<FooterModalContextValue | null>(null);

export function FooterModalProvider({
  services,
  ctaText,
  ctaLink,
  children,
}: {
  services: ServiceDetail[];
  ctaText?: string | null;
  ctaLink?: string | null;
  children: ReactNode;
}) {
  const { open, setTriggerRef, modal } = useServiceModal(services, {
    ctaText,
    ctaLink,
  });

  return (
    <FooterModalContext.Provider value={{ open, setTriggerRef }}>
      {children}
      {modal}
    </FooterModalContext.Provider>
  );
}

export function useFooterModal() {
  return useContext(FooterModalContext);
}
