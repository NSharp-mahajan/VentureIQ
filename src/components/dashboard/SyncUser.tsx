"use client";

import { useEffect } from "react";

export function SyncUser() {
  useEffect(() => {
    async function sync() {
      try {
        await fetch("/api/users/sync", {
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    }
    sync();
  }, []);

  return null;
}
