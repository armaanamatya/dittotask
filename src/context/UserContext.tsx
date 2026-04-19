'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/types';

interface UserContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  allUsers: User[];
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({
  currentUser: null,
  setCurrentUser: () => {},
  allUsers: [],
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((users: User[]) => {
        setAllUsers(users);
        const savedId = localStorage.getItem('ditto-userId');
        if (savedId) {
          const found = users.find((u) => u.id === savedId);
          if (found) setCurrentUserState(found);
          else if (users.length > 0) setCurrentUserState(users[0]);
        } else if (users.length > 0) {
          // Auto-select first user so the app boots straight into admin view
          setCurrentUserState(users[0]);
          localStorage.setItem('ditto-userId', users[0].id);
        }
        setLoading(false);
      });
  }, []);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('ditto-userId', user.id);
    } else {
      localStorage.removeItem('ditto-userId');
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, allUsers, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
