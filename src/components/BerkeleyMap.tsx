'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { MapUser, ActivityPost, ActivityCandidate } from '@/lib/types';

// Fix default marker icons in Next.js/webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BERKELEY_CENTER: [number, number] = [37.8719, -122.2585];

function createIcon(color: string, size: number = 12, glow: boolean = false) {
  const shadow = glow ? `0 0 8px 2px ${color}` : 'none';
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:2px solid white;
      box-shadow: ${shadow}, 0 1px 4px rgba(0,0,0,0.3);
    "></div>`,
  });
}

const ICONS = {
  user: createIcon('#6366f1', 12),
  userMuted: createIcon('#94a3b8', 10),
  userCandidate: createIcon('#10b981', 14, true),
  postActive: createIcon('#f43f5e', 16, true),
  postMatched: createIcon('#8b5cf6', 14),
  postExpired: createIcon('#94a3b8', 10),
};

interface Props {
  users: MapUser[];
  posts: ActivityPost[];
  selectedPostId: string | null;
  candidates: ActivityCandidate[];
  currentUserId: string;
  onSelectPost: (postId: string) => void;
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export default function BerkeleyMap({
  users,
  posts,
  selectedPostId,
  candidates,
  currentUserId,
  onSelectPost,
}: Props) {
  const candidateIds = new Set(candidates.map(c => c.id));
  const selectedPost = posts.find((p) => p.id === selectedPostId);
  const centerLat = selectedPost?.latitude ?? BERKELEY_CENTER[0];
  const centerLng = selectedPost?.longitude ?? BERKELEY_CENTER[1];

  return (
    <MapContainer
      center={BERKELEY_CENTER}
      zoom={15}
      minZoom={14}
      maxZoom={18}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '16px' }}
      maxBounds={[
        [37.855, -122.285],
        [37.895, -122.240],
      ]}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {selectedPostId && (
        <RecenterMap lat={centerLat} lng={centerLng} />
      )}

      {/* User markers */}
      {users.map((u) => {
        const isCandidate = candidateIds.has(u.id);
        const isCurrent = u.id === currentUserId;
        let icon = ICONS.userMuted;
        if (isCurrent) icon = ICONS.user;
        else if (selectedPostId && isCandidate) icon = ICONS.userCandidate;
        else if (!selectedPostId) icon = ICONS.user;

        return (
          <Marker key={`user-${u.id}`} position={[u.latitude, u.longitude]} icon={icon}>
            <Popup>
              <div style={{ minWidth: 140 }}>
                <strong style={{ fontSize: 13 }}>{u.name}</strong>
                <br />
                <span style={{ fontSize: 11, color: '#64748b' }}>{u.major}</span>
                <br />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>📍 {u.locationLabel}</span>
                {isCandidate && (
                  <div style={{ marginTop: 4, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                    ✓ Down for this
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Activity post markers */}
      {posts.map((p) => {
        let icon = ICONS.postActive;
        if (p.status === 'matched') icon = ICONS.postMatched;
        else if (p.status === 'expired') icon = ICONS.postExpired;
        const isSelected = p.id === selectedPostId;
        if (isSelected) {
          icon = createIcon('#f43f5e', 20, true);
        }

        return (
          <Marker
            key={`post-${p.id}`}
            position={[p.latitude, p.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onSelectPost(p.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ fontSize: 13 }}>{p.authorName}</strong>
                <br />
                <span style={{ fontSize: 12 }}>"{p.body}"</span>
                <br />
                <span style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 8,
                  background: p.status === 'active' ? '#fef2f2' : p.status === 'matched' ? '#f5f3ff' : '#f1f5f9',
                  color: p.status === 'active' ? '#e11d48' : p.status === 'matched' ? '#7c3aed' : '#64748b',
                  fontWeight: 600,
                  display: 'inline-block',
                  marginTop: 4,
                }}>
                  {p.activityType} · {p.status}
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Connection Lines */}
      {selectedPost && candidates.map(c => {
        // Line color based on compatibility score (red to green)
        const r = Math.round(255 * Math.max(0, 1 - c.compatibilityScore));
        const g = Math.round(255 * Math.min(1, c.compatibilityScore));
        const color = `rgb(${r}, ${g}, 0)`;
        return (
          <Polyline
            key={`line-${c.id}`}
            positions={[
              [selectedPost.latitude, selectedPost.longitude],
              [c.latitude, c.longitude]
            ]}
            color={color}
            weight={3}
            dashArray="5, 8"
            opacity={0.6}
          />
        );
      })}
    </MapContainer>
  );
}
