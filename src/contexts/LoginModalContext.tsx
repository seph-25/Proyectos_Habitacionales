import { createContext, useContext, useState } from "react";
import { LoginModal } from "@/components/auth/LoginModal";

interface LoginModalContextValue {
  openLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextValue>({
  openLoginModal: () => {},
});

export const useLoginModal = () => useContext(LoginModalContext);

export const LoginModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LoginModalContext.Provider value={{ openLoginModal: () => setIsOpen(true) }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </LoginModalContext.Provider>
  );
};
