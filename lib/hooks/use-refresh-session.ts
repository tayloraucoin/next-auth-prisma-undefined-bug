import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';

function useRefreshableSession() {
  const sessionData = useSession();
  const { data: session, status } = sessionData;
  const [refreshedSession, setRefreshedSession] = useState(session);

  console.log('useSession all', sessionData);

  const refreshSession = async () => {
    console.log('Refreshing session...');
    try {
      const newSession = await getSession();
      console.log('New session data:', newSession);
      setRefreshedSession(newSession);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  useEffect(() => {
    console.log('Session changed:', session);
    console.log('Session status:', status);
    setRefreshedSession(session);
  }, [session]);

  console.log('Current refreshed session:', refreshedSession);
  console.log('Session status:', status);

  return { session: refreshedSession, status, refreshSession };
}

export default useRefreshableSession;
