import React from 'react';

interface MusicTrackProps {
  name: string;
  trackNumber: number;
  nameJp?: string;
  nameEn?: string;
  originalTitle?: string;
  composer?: string;
  themeColor?: string;
  zunComment?: string;
  children?: React.ReactNode;
}

const MusicTrack: React.FC<MusicTrackProps> = ({
  name,
  trackNumber,
  nameJp,
  nameEn,
  originalTitle,
  composer = 'ZUN',
  themeColor = 'var(--ifm-color-primary)',
  zunComment,
  children
}) => {
  const numberStr = String(trackNumber).padStart(2, '0');

  return (
    <div style={{
      display: 'flex',
      marginBottom: '2rem',
      gap: '1rem',
      alignItems: 'flex-start'
    }}>
      {/* Track Number "Avatar" */}
      <div style={{
        flexShrink: 0,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'var(--ifm-background-surface-color)',
        border: `2px solid ${themeColor}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: themeColor,
        fontWeight: 'bold',
        fontSize: '1.1rem',
        fontFamily: 'var(--ifm-font-family-monospace)'
      }}>
        {numberStr}
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Title Label */}
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 'bold',
          marginBottom: '0.25rem',
          color: themeColor,
          padding: '0 0.5rem',
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.6rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '1.1rem' }}>{name}</span>
          {(nameJp || nameEn) && (
            <span style={{
              fontWeight: 'normal',
              opacity: 0.7,
              fontSize: '0.85rem',
              fontStyle: 'italic'
            }}>
              {nameJp}{nameJp && nameEn ? ' · ' : ''}{nameEn}
            </span>
          )}
          {originalTitle && (
            <span style={{
              fontWeight: 'normal',
              opacity: 0.7,
              fontSize: '0.8rem'
            }}>
              원곡: {originalTitle}
            </span>
          )}
        </div>

        {/* Info Bubble */}
        <div style={{
          position: 'relative',
          padding: '1rem',
          backgroundColor: 'var(--ifm-background-surface-color)',
          color: 'var(--ifm-font-color-base)',
          borderRadius: '14px',
          borderTopLeftRadius: '4px',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderLeft: `4px solid ${themeColor}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--ifm-color-emphasis-600)',
            marginBottom: (zunComment || children) ? '0.75rem' : '0',
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: (zunComment || children) ? '1px solid var(--ifm-color-emphasis-200)' : 'none',
            paddingBottom: (zunComment || children) ? '0.5rem' : '0'
          }}>
            <span>작곡: {composer}</span>
          </div>
          {zunComment && (
            <div style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {zunComment}
            </div>
          )}
          {children && (
            <div style={{
              fontSize: '0.95rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              marginTop: zunComment ? '0.75rem' : '0'
            }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicTrack;
