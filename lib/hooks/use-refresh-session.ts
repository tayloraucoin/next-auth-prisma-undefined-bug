import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';

function useRefreshableSession() {
  const { data: session, status } = useSession();
  const [refreshedSession, setRefreshedSession] = useState(session);

  const refreshSession = async () => {
    const newSession = await getSession();
    setRefreshedSession(newSession);
  };

  useEffect(() => {
    setRefreshedSession(session);
  }, [session]);

  return { session: refreshedSession, status, refreshSession };
}

export default useRefreshableSession;
