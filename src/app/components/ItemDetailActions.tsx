import React from "react";

import { buildWhatsAppUrl } from "../appState";
import { Button } from "./ui/button";

type ExtraAction = {
  key: string;
  label: string;
  onClick: () => void;
  className?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
};

interface ItemDetailActionsProps {
  contact?: string;
  itemTitle: string;
  showContact?: boolean;
  extraActions?: ExtraAction[];
}

export function ItemDetailActions({
  contact,
  itemTitle,
  showContact = true,
  extraActions = [],
}: ItemDetailActionsProps) {
  if ((!contact || !showContact) && extraActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
      {contact && showContact ? (
        <Button
          variant="outline"
          className="h-auto w-full whitespace-normal px-4 py-2.5 text-center leading-snug rounded-sm sm:min-w-0 sm:flex-1"
          asChild
        >
          <a
            href={buildWhatsAppUrl(contact, itemTitle)}
            target="_blank"
            rel="noreferrer"
          >
            Hubungi Pelapor
          </a>
        </Button>
      ) : null}

      {extraActions.map((action) => (
        <Button
          key={action.key}
          variant={action.variant}
          onClick={action.onClick}
          className={`h-auto w-full whitespace-normal px-4 py-2.5 text-center leading-snug rounded-sm sm:min-w-0 sm:flex-1 ${action.className ?? ""}`.trim()}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
