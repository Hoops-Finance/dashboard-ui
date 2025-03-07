"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import AuthForm from "./AuthForm";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  isLogin: boolean;
  defaultEmail?: string;
  errorParam?: string;
  oauthEmail?: string;
  oauthProvider?: string;
  oauthCode?: string;
  recaptchaSiteKey?: string;
}

export function AuthModal(props: AuthModalProps) {
  const {
    open,
    onClose,
    isLogin,
    defaultEmail,
    errorParam,
    oauthEmail,
    oauthProvider,
    oauthCode,
    recaptchaSiteKey,
  } = props;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLogin ? "Log In" : "Sign Up"}</DialogTitle>
          <DialogDescription>{isLogin ? "Welcome back!" : "Create your account"}</DialogDescription>
        </DialogHeader>
        <AuthForm
          isLogin={isLogin}
          defaultEmail={defaultEmail}
          errorParam={errorParam}
          oauthEmail={oauthEmail}
          oauthProvider={oauthProvider}
          oauthCode={oauthCode}
          recaptchaSiteKey={recaptchaSiteKey}
        />
        <DialogClose asChild>
          <button className="auth-close-button">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
