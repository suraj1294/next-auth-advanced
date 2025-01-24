"use client";

import { UserInfo } from "@/components/user-info";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Loader2 } from "lucide-react";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ClientPage = () => {
  //const user = useCurrentUser();

  const [user, setUser] = useState<Session["user"] | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();
      setUser(session?.user || null);
    };
    fetchUser();
  }, []);

  if (!user) {
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  return <UserInfo label="📱 Client component" user={user} />;
};

export default ClientPage;
