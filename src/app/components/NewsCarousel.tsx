import React from "react";
import ik4Img from "../../assets/ik4.webp";
import type { ItemReturnVerification } from "../appState";

interface NewsCarouselProps {
  items?: any[];
  returnVerifications?: ItemReturnVerification[];
  onNavigate?: (view: string) => void;
  canUpdateStatus?: boolean;
  currentUserEmail?: string;
  currentUserId?: string;
  isAdminUser?: boolean;
  onOpenReturnVerification?: (itemId: number) => void;
  onApproveVerification?: (itemId: number) => Promise<boolean>;
}

export function NewsCarousel({}: NewsCarouselProps = {}) {
  return (
    <div className="relative h-[150px] w-full rounded-sm overflow-hidden sm:h-[260px] md:h-[400px] lg:h-[460px]">
      <img
        src={ik4Img}
        alt="Cara Melaporkan Barang Hilang Dengan Efektif"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
