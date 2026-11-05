import { useEffect, useRef, useState } from "react";
import { isAdminEmail } from "@shared/adminEmails";
import { logout, onAuthStateChanged, type User } from "@/lib/firebase";

const UNAUTHORIZED_MESSAGE = "This Gmail account is not authorized to manage CAFOLA.";

export function useStaffSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const rejectedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async currentUser => {
      if (currentUser && !isAdminEmail(currentUser.email)) {
        rejectedRef.current = true;
        try {
          await logout();
        } catch (error) {
          console.error("Could not sign out an unauthorized account", error);
        }
        setUser(null);
        setLoginError(UNAUTHORIZED_MESSAGE);
        setLoading(false);
        return;
      }

      if (!currentUser && rejectedRef.current) {
        setUser(null);
        setLoading(false);
        return;
      }

      rejectedRef.current = false;
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, loginError, setLoginError };
}
