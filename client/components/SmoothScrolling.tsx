"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        // Safety cleanup for left-over Radix UI scroll locks when changing routes
        document.body.style.pointerEvents = "";
        document.body.removeAttribute("data-scroll-locked");

        if (window.location.hash) {
            const hash = window.location.hash;
            const targetEl = document.querySelector(hash);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
                return;
            }
            // If DOM isn't fully ready yet, retry briefly
            const timer = setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
            return () => clearTimeout(timer);
        } else {
            window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }
    }, [pathname]);

    return <>{children}</>;
}
