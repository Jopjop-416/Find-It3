import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ItemDetailActions } from "./ItemDetailActions";
import { MapPin, Calendar, User } from "lucide-react";
import {
  getEffectiveItemStatus,
  getItemStatusLabel,
  getReturnVerificationForItem,
  getReporterDisplayName,
  isReporterForItem,
  shouldShowContactAction,
  shouldShowItemInHistory,
  type ItemReturnVerification,
} from "../appState";

export interface ItemCardProps {
  item: any;
  returnVerifications?: ItemReturnVerification[];
  canUpdateStatus?: boolean;
  currentUserEmail?: string;
  currentUserId?: string;
  isAdminUser?: boolean;
  onOpenReturnVerification?: (itemId: number) => void;
  onApproveVerification?: (itemId: number) => Promise<boolean>;
  ownershipFilter?: "all" | "mine" | "history";
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ItemCardDetail({
  item,
  returnVerifications = [],
  canUpdateStatus = false,
  currentUserEmail = "",
  currentUserId = "",
  isAdminUser = false,
  onOpenReturnVerification,
  onApproveVerification,
  ownershipFilter = "all",
}: Omit<ItemCardProps, "open" | "defaultOpen" | "onOpenChange">) {
  const verificationRecord = getReturnVerificationForItem(item, returnVerifications);
  const effectiveStatus = getEffectiveItemStatus(item, returnVerifications);

  const showVerificationSection = Boolean(
    verificationRecord &&
      (effectiveStatus === "pending_verification" ||
        (ownershipFilter === "history" && shouldShowItemInHistory(item, returnVerifications))),
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item.title}</DialogTitle>
        <DialogDescription>
          Detail lengkap tentang barang {item.type === "lost" ? "hilang" : "ditemukan"}.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="relative h-48 sm:h-64">
          <ImageWithFallback
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover rounded-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={item.type === "lost" ? "destructive" : "default"}
            className="rounded-xs"
          >
            {item.type === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
          </Badge>
          <Badge variant="secondary" className="rounded-xs">
            {item.category}
          </Badge>
          <Badge variant="outline" className="rounded-xs">
            {getItemStatusLabel(effectiveStatus)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Deskripsi:</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{new Date(item.date).toLocaleDateString("id-ID")}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{getReporterDisplayName(item)}</span>
            </div>
          </div>
        </div>

        {showVerificationSection && verificationRecord && (
          <div className="space-y-3 rounded-sm border bg-gray-50 p-4">
            <h4 className="font-semibold text-sm">Data Verifikasi Serah Terima</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs">Nama</p>
                <p>{verificationRecord.reporterName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p>{verificationRecord.reporterEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">No HP</p>
                <p>{verificationRecord.reporterPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">NIM</p>
                <p>{verificationRecord.reporterNim}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Foto Serah Terima</p>
              <img
                src={verificationRecord.handoverPhoto}
                alt="Foto serah terima"
                className="max-h-64 w-full max-w-md rounded-sm border bg-white object-contain"
              />
            </div>
          </div>
        )}

        <ItemDetailActions
          contact={item.contact}
          itemTitle={item.title}
          showContact={shouldShowContactAction(item, currentUserEmail, currentUserId)}
          extraActions={[
            ...(canUpdateStatus &&
            isReporterForItem(item, currentUserEmail, currentUserId) &&
            effectiveStatus === "active" &&
            item.type === "lost" &&
            onOpenReturnVerification
              ? [
                  {
                    key: "verify-found",
                    label: "Verifikasi Barang Sudah Ditemukan",
                    onClick: () => onOpenReturnVerification(item.id),
                  },
                ]
              : []),
            ...(canUpdateStatus &&
            isReporterForItem(item, currentUserEmail, currentUserId) &&
            effectiveStatus === "available" &&
            item.type === "found" &&
            onOpenReturnVerification
              ? [
                  {
                    key: "mark-claimed",
                    label: "Tandai Sudah Diambil",
                    onClick: () => onOpenReturnVerification(item.id),
                  },
                ]
              : []),
            ...(isAdminUser && effectiveStatus === "pending_verification" && onApproveVerification
              ? [
                  {
                    key: "admin-approve",
                    label: "Verifikasi Admin",
                    onClick: () => {
                      void onApproveVerification(item.id);
                    },
                    className: "bg-black text-white hover:bg-gray-800",
                  },
                ]
              : []),
          ]}
        />
      </div>
    </>
  );
}

export function ItemCard({
  item,
  returnVerifications = [],
  canUpdateStatus = false,
  currentUserEmail = "",
  currentUserId = "",
  isAdminUser = false,
  onOpenReturnVerification,
  onApproveVerification,
  ownershipFilter = "all",
  defaultOpen,
  open,
  onOpenChange,
}: ItemCardProps) {
  const effectiveStatus = getEffectiveItemStatus(item, returnVerifications);

  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogTrigger className="w-full text-left">
        <Card
          className={`self-start cursor-pointer overflow-hidden rounded-sm gap-0 transition-all duration-500 ease-in-out hover:-translate-y-1 flex flex-col ${
            effectiveStatus === "pending_verification" ? "bg-gray-200 text-gray-600" : ""
          }`}
        >
          <div
            className={`relative aspect-[16/10] w-full shrink-0 overflow-hidden ${
              effectiveStatus === "pending_verification" ? "grayscale" : ""
            }`}
          >
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 max-w-[48%] rounded-[2px] bg-white/95 text-gray-800 hover:bg-white text-[10px] px-1.5 py-0.5 sm:top-2.5 sm:right-2.5 sm:max-w-[45%] sm:px-2 shadow-xs"
            >
              <span className="line-clamp-1 break-all">{item.category}</span>
            </Badge>
          </div>

          <div
            className={`px-3 py-1 text-center text-xs font-semibold text-white ${
              effectiveStatus === "pending_verification"
                ? "bg-gray-500"
                : item.type === "lost"
                  ? "bg-[#AE0000]"
                  : "bg-black"
            }`}
          >
            {item.type === "lost" ? "Hilang" : "Ditemukan"}
          </div>

          <CardContent className="flex flex-col p-3 pt-2.5 sm:p-3.5 sm:pt-3">
            <h3 className="mb-1 line-clamp-1 text-sm font-semibold leading-snug sm:mb-1.5 sm:text-base">
              {item.title}
            </h3>
            <p className="mb-2 line-clamp-1 text-[11px] text-muted-foreground sm:mb-2.5 sm:text-xs">
              {item.description}
            </p>

            <div className="space-y-1.5">
              <div className="flex min-w-0 items-center text-[11px] text-muted-foreground sm:text-xs">
                <MapPin className="mr-1 h-3 w-3 shrink-0 text-orange-500 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                <span className="line-clamp-1">{item.location}</span>
              </div>
              <div className="flex items-center text-[11px] text-muted-foreground sm:text-xs">
                <Calendar className="mr-1 h-3 w-3 shrink-0 text-orange-500 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                {new Date(item.date).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-sm">
        <ItemCardDetail
          item={item}
          returnVerifications={returnVerifications}
          canUpdateStatus={canUpdateStatus}
          currentUserEmail={currentUserEmail}
          currentUserId={currentUserId}
          isAdminUser={isAdminUser}
          onOpenReturnVerification={onOpenReturnVerification}
          onApproveVerification={onApproveVerification}
          ownershipFilter={ownershipFilter}
        />
      </DialogContent>
    </Dialog>
  );
}
