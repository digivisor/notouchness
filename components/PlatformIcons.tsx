// Platform SVG Icons
import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// E-ticaret Platformları
export const TrendyolIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
  </svg>
);

export const HepsiburadaIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
  </svg>
);

export const TemuIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
);

export const EtsyIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 5h10v2H7V5zm0 6h10v2H7v-2zm0 6h7v2H7v-2z"/>
  </svg>
);

export const AmazonIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.5 14c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.8 2.7 2.8 2.7-1.2 2.7-2.7-1.2-2.8-2.7-2.8zM3 11.5v2h3.5L9 16l3.5-2.5H16v-2H3zm12-6C13.5 4.1 12 2.6 10.5 2.1 9 1.6 7.5 1.9 6.3 2.8c-.7.5-1.1 1.4-1.1 2.2 0 1.1.6 2.1 1.5 2.7L10 10l3.3-2.3c.9-.6 1.5-1.6 1.5-2.7 0-.8-.4-1.7-1.1-2.2C12.5 1.9 11 1.6 9.5 2.1 8 2.6 6.5 4.1 5 5.5"/>
  </svg>
);

export const ShopifyIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M15.8 2.1c0 .1-.1.2-.1.3-.1.3-.3.5-.5.7-.2.1-.4.2-.7.2h-.3c-.3 0-.6-.1-.8-.2-.2-.1-.4-.3-.5-.5-.1-.2-.2-.4-.2-.7V1c0-.3 0-.5.1-.8.1-.2.2-.4.3-.6.2-.2.4-.3.6-.4.2-.1.5-.1.7-.1h.1c.3 0 .6.1.8.2.3.1.5.3.7.6.1.2.2.5.2.8v.4zm3.7 17.3l-6 3.5-6-3.5V8.7l6-3.5 6 3.5v10.7z"/>
  </svg>
);

export const SahibindenIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

export const N11Icon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h8v-2h-8V9h8V7h-8V5h8V3h-8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2h-8z"/>
  </svg>
);

// Geliştirici Platformları
export const GitLabIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.42l3.684-11.333h-7.368L12 21.42zM2.667 10.087l1.842-5.67.001-.006 1.842 5.676h-3.685zm18.666 0L23.175 4.42l-1.842 5.667h-3.685l1.843-5.67zM12 21.42l-3.684-11.333H2.667L12 21.42zm0 0l3.684-11.333h5.649L12 21.42z"/>
  </svg>
);

export const DevToIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6l.02 2.44.04 2.45h.56c.42 0 .63-.09.83-.27.24-.24.26-.36.26-2.2 0-1.91-.02-1.96-.29-2.19zM0 4.94v14.12h24V4.94H0zm8.56 10.78c-.45.5-1.03.74-1.76.74H4.71V8.53h2.09c.73 0 1.31.24 1.76.74.46.5.68 1.33.68 2.48 0 1.15-.22 1.98-.68 2.48zm7.16-2.43h-1.46v1.06h1.46v1.04h-1.46v1.78h-1.04V8.53h2.5v1.04zm4.33 3.57h-1.04v-4.61l-1.22 4.61h-.77l-1.21-4.61v4.61h-1.04V8.53h1.52l1.25 4.67 1.24-4.67h1.52v5.66z"/>
  </svg>
);

export const StackOverflowIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M15 21h-10v-2h10v2zm6-11.665l-1.621-9.335-1.993.346 1.62 9.335 1.994-.346zm-5.964 6.937l-9.746-.975-.186 2.016 9.755.879.177-1.92zm.538-2.587l-9.276-2.608-.526 1.954 9.306 2.5.496-1.846zm1.204-2.413l-8.297-4.864-1.029 1.743 8.298 4.865 1.028-1.744zm1.866-1.467l-5.339-7.829-1.672 1.14 5.339 7.829 1.672-1.14zm-2.644 4.195v8h-12v-8h-2v10h16v-10h-2z"/>
  </svg>
);

export const FigmaIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12m0-4a4 4 0 1 0 8 0 4 4 0 1 0-8 0zm-4 8a4 4 0 0 0 4-4v-4H8a4 4 0 0 0 0 8zm0-8h4V4H8a4 4 0 0 0 0 8zm8-4v4a4 4 0 1 0 0-8 4 4 0 0 0 0 4z"/>
  </svg>
);

export const NotionIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 2h16l4 4v16H4V2zm0 2v16h16V6h-4V4H4z"/>
  </svg>
);

// Ödeme Platformları
export const RevolutIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

export const WiseIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/>
  </svg>
);

export const PaparaIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
  </svg>
);

// Sosyal Medya (eksik olanlar için)
export const ThreadsIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

export const ClubhouseIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
  </svg>
);

// Mesajlaşma
export const WeChatIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8.5 10c-.83 0-1.5.67-1.5 1.5S7.67 13 8.5 13s1.5-.67 1.5-1.5S9.33 10 8.5 10zm7 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.48.41-2.86 1.12-4.06 1.19.93 2.7 1.48 4.38 1.48 1.34 0 2.58-.38 3.64-1.04.37.77.86 1.46 1.44 2.04-.75.66-1.73 1.06-2.78 1.06-1.66 0-3-1.34-3-3 0-.35.06-.69.17-1H7.5C5.57 7.48 4 9.05 4 11v1c0 2.76 2.24 5 5 5h2v3c0 .55.45 1 1 1s1-.45 1-1v-3h2c2.76 0 5-2.24 5-5v-1c0-1.95-1.57-3.52-3.5-3.52h-.47c.11.32.17.66.17 1 0 1.66-1.34 3-3 3-1.05 0-2.03-.4-2.78-1.06.58-.58 1.07-1.27 1.44-2.04C13.42 8.38 14.66 8 16 8c1.68 0 3.19-.55 4.38-1.48C20.59 9.14 21 10.52 21 12c0 4.41-3.59 8-8 8z"/>
  </svg>
);

export const LineIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-4-4h3V9h2v4h3l-4 4z"/>
  </svg>
);

// Müzik Platformları
export const SoundCloudIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 17v-6l1 3-1 3zm2 0v-8l1 4-1 4zm2 0v-10l1 5-1 5zm2 0V7l1 5-1 5zm2 0V5l1 6-1 6zm10-6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

export const BandcampIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M0 8l8 8H24L16 8H0z"/>
  </svg>
);

export const AppleMusicIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7C10.62 9.5 9.5 10.62 9.5 12s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/>
  </svg>
);

export const DeezerIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.81 2v3.45h3.1V2h-3.1zM14.25 6.69v3.45h3.1V6.69h-3.1zm0 4.69v3.45h3.1v-3.45h-3.1zm0 4.69v3.45h3.1v-3.45h-3.1zm4.56-4.69v3.45h3.1v-3.45h-3.1zm0 4.69v3.45h3.1v-3.45h-3.1z"/>
  </svg>
);

// Video/Streaming
export const VimeoIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22 7.42c-.1 2.16-1.61 5.12-4.54 8.88C14.41 20.2 11.96 22 10.01 22c-1.17 0-2.16-1.08-2.97-3.24-.54-1.98-1.08-3.96-1.62-5.94-.6-2.16-1.25-3.24-1.93-3.24-.15 0-.68.32-1.59.96L1 9.24c1.01-.89 2-1.78 2.97-2.67 1.33-1.15 2.33-1.75 3.01-1.81 1.6-.15 2.59.94 2.97 3.27.41 2.51.69 4.07.85 4.67.48 2.19.99 3.28 1.56 3.28.44 0 1.11-.7 2-2.1.89-1.4 1.37-2.47 1.43-3.2.12-1.21-.35-1.81-1.4-1.81-.5 0-1.01.11-1.54.35 1.03-3.37 2.99-5.01 5.89-4.92 2.15.06 3.16 1.46 3.04 4.2z"/>
  </svg>
);

export const DailymotionIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M13.55 11.97c-.28.37-.63.55-1.05.55-.73 0-1.33-.6-1.33-1.33 0-.73.6-1.33 1.33-1.33.42 0 .77.18 1.05.55V7.5h2.55v9h-2.55v-.53zM2 3v18h20V3H2zm17.5 15.5h-15v-13h15v13z"/>
  </svg>
);

export const RumbleIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L1 21h22L12 2zm0 4.5l7.5 13h-15l7.5-13z"/>
  </svg>
);

export const KickIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

// Profesyonel Ağlar
export const XingIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.6 5.4L13.2 15l3.4 6h-4.2l-3.4-6 5.4-9.6h4.2zM8.8 3L6.2 8.2 9.8 15H5.6l-3.6-6.8L4.6 3h4.2z"/>
  </svg>
);

export const AngelListIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L1 12h3v9h7v-6h2v6h7v-9h3L12 2z"/>
  </svg>
);

export const CrunchbaseIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H9c-1.65 0-3-1.35-3-3V10c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3v4c0 1.65-1.35 3-3 3z"/>
  </svg>
);

export const ProductHuntIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-3H9V8h4c1.66 0 3 1.34 3 3s-1.34 3-3 3zm0-4h-2V9h2c.55 0 1 .45 1 1s-.45 1-1 1z"/>
  </svg>
);

// Rezervasyon/Servis
export const BookingIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
  </svg>
);

export const AirbnbIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

export const TripAdvisorIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l2 4h3l-2 2 1 3-4-2-4 2 1-3-2-2h3l2-4zm0 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export const UberIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

export const BoltIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

// Content Platforms
export const SubstackIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 3h18v4H3V3zm0 6h18v12L12 15 3 21V9z"/>
  </svg>
);

export const PatreonIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="15" cy="9.5" r="6.5"/>
    <path d="M2 2h4v20H2z"/>
  </svg>
);

export const KoFiIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"/>
  </svg>
);

export const BuyMeACoffeeIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM2 21h18v-2H2v2z"/>
  </svg>
);

// Messenger Icons (Lucide'da olmayanlar için alternatifler)
export const AliExpressIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

export const GittigidiyorIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

export const EbayIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

