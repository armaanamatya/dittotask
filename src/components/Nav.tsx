'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export function Nav() {
  const { currentUser, allUsers, setCurrentUser, loading } = useUser();
  const pathname = usePathname();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = allUsers.find((u) => u.id === e.target.value) ?? null;
    setCurrentUser(user);
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      style={{
        fontSize: 13,
        fontWeight: pathname === href ? 600 : 400,
        color: pathname === href ? '#f43f5e' : '#64748b',
        textDecoration: 'none',
        transition: 'color 0.15s',
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{
      background: '#1a1d27',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: 56,
    }}>
      <div style={{
        maxWidth: '100%',
        padding: '0 20px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: '#f43f5e',
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <span style={{
            width: 26,
            height: 26,
            background: '#f43f5e',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 13,
            fontWeight: 700,
          }}>
            D
          </span>
          Ditto Lab
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {currentUser && (
            <>
              {navLink('/insights', 'Insights')}
            </>
          )}

          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 12 }}>|</span>
              <select
                value={currentUser?.id ?? ''}
                onChange={handleUserChange}
                style={{
                  fontSize: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  padding: '4px 8px',
                  background: '#0f1117',
                  color: '#94a3b8',
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: 160,
                  fontFamily: 'inherit',
                }}
              >
                <option value="" disabled>Select user</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
