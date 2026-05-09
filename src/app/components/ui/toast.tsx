import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isEntering, setIsEntering] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsEntering(true);
      setIsLeaving(false);

      enterTimerRef.current = window.setTimeout(() => {
        setIsEntering(false);
      }, 30);

      closeTimerRef.current = window.setTimeout(() => {
        setIsLeaving(true);
      }, 3000);
    } else if (shouldRender) {
      setIsLeaving(true);
    }

    return () => {
      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
      }
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [isVisible, shouldRender]);

  useEffect(() => {
    if (!isLeaving) return;

    exitTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 260);

    return () => {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, [isLeaving, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed top-20 right-4 sm:top-18 sm:right-8 z-50 transition-all duration-300 ease-out ${
        isLeaving
          ? "translate-x-6 translate-y-2 opacity-0 scale-95"
          : isEntering
            ? "translate-x-8 translate-y-3 opacity-0 scale-95"
          : "translate-x-0 translate-y-0 opacity-100 scale-100"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4 flex items-center space-x-3 min-w-[320px] max-w-[calc(100vw-3rem)]">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <p className="text-sm text-gray-900 flex-1">{message}</p>
        <button
          onClick={() => setIsLeaving(true)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
