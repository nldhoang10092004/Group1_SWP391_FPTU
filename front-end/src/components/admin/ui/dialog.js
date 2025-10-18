import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./utils";

// Cấu trúc cơ bản
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

// Overlay mờ nền
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 bg-black/50 backdrop-blur-sm z-50", className)}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

// Nội dung Dialog chính
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

// 🧩 3 export bị thiếu trong lỗi bạn nêu
function DialogHeader({ children, className }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>;
}

function DialogTitle({ children, className }) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

function DialogDescription({ children, className }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

// ✅ Export tất cả component
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};
