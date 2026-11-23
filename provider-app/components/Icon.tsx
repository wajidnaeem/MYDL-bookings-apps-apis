import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'calendar' | 'wallet' | 'bell' | 'briefcase' | 'plus' | 'qr' | 'clock' | 'pin'
  | 'user' | 'mail' | 'phone' | 'chevron' | 'share' | 'edit' | 'cancel' | 'alert' | 'shield'
  | 'card' | 'check' | 'file' | 'scale' | 'logout' | 'refresh' | 'tag' | 'timer' | 'lock' | 'bank' | 'inbox' | 'paperclip';

export function Icon({ name, size = 20, color = '#14181D', strokeWidth = 1.8 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const p = { stroke: color, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(name, p)}
    </Svg>
  );
}

type P = { stroke: string; strokeWidth: number; fill: string; strokeLinecap: 'round'; strokeLinejoin: 'round' };

function render(name: IconName, p: P) {
  switch (name) {
    case 'home':
      return <><Path d="M3 10.5L12 3l9 7.5" {...p} /><Path d="M5 9.5V20h14V9.5" {...p} /><Path d="M10 20v-6h4v6" {...p} /></>;
    case 'calendar':
      return <><Rect x="3" y="5" width="18" height="16" rx="2.5" {...p} /><Path d="M3 10h18M8 3v4M16 3v4" {...p} /></>;
    case 'wallet':
      return <><Path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" {...p} /><Rect x="3" y="8" width="18" height="12" rx="2.5" {...p} /><Circle cx="16.5" cy="14" r="1.2" {...p} /></>;
    case 'bell':
      return <><Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" {...p} /><Path d="M10 20.5a2 2 0 0 0 4 0" {...p} /></>;
    case 'briefcase':
      return <><Rect x="3" y="7" width="18" height="13" rx="2.5" {...p} /><Path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18" {...p} /></>;
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...p} />;
    case 'qr':
      return <><Rect x="3" y="3" width="7" height="7" rx="1.5" {...p} /><Rect x="14" y="3" width="7" height="7" rx="1.5" {...p} /><Rect x="3" y="14" width="7" height="7" rx="1.5" {...p} /><Path d="M14 14h3v3h-3zM20 14v.01M14 20.5h.01M17.5 20.5H21v-3.5" {...p} /></>;
    case 'clock':
      return <><Circle cx="12" cy="12" r="9" {...p} /><Path d="M12 7v5l3 2" {...p} /></>;
    case 'timer':
      return <><Circle cx="12" cy="13" r="8" {...p} /><Path d="M12 9v4l2.5 1.5M9 2h6" {...p} /></>;
    case 'pin':
      return <><Path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" {...p} /><Circle cx="12" cy="9.5" r="2.5" {...p} /></>;
    case 'user':
      return <><Circle cx="12" cy="8" r="4" {...p} /><Path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6" {...p} /></>;
    case 'mail':
      return <><Rect x="3" y="5" width="18" height="14" rx="2.5" {...p} /><Path d="M3.5 6.5L12 13l8.5-6.5" {...p} /></>;
    case 'phone':
      return <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" {...p} />;
    case 'chevron':
      return <Path d="M9 6l6 6-6 6" {...p} />;
    case 'share':
      return <><Path d="M12 3v13M7 8l5-5 5 5" {...p} /><Path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" {...p} /></>;
    case 'edit':
      return <><Path d="M4 20h4L19 9l-4-4L4 16z" {...p} /><Path d="M13.5 6.5l4 4" {...p} /></>;
    case 'cancel':
      return <><Circle cx="12" cy="12" r="9" {...p} /><Path d="M9 9l6 6M15 9l-6 6" {...p} /></>;
    case 'alert':
      return <><Path d="M12 3l9.5 17h-19z" {...p} /><Path d="M12 10v4.5M12 17.5h.01" {...p} /></>;
    case 'shield':
      return <><Path d="M12 3l8 3.5V12c0 4.8-3.4 8-8 9-4.6-1-8-4.2-8-9V6.5z" {...p} /><Path d="M9 12l2 2 4-4" {...p} /></>;
    case 'card':
      return <><Rect x="3" y="5" width="18" height="14" rx="2.5" {...p} /><Path d="M3 10h18M7 15h4" {...p} /></>;
    case 'bank':
      return <><Path d="M3 9.5L12 4l9 5.5M4.5 20h15M6 10v7M10 10v7M14 10v7M18 10v7" {...p} /></>;
    case 'check':
      return <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />;
    case 'file':
      return <><Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...p} /><Path d="M14 3v5h5M9 13h6M9 17h4" {...p} /></>;
    case 'paperclip':
      return <Path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7-7L13 4.5a3.3 3.3 0 0 1 4.7 4.7l-8.3 8.3a1.7 1.7 0 0 1-2.4-2.4L14.5 7.6" {...p} />;
    case 'scale':
      return <><Path d="M12 3v18M7 21h10M5 7h14" {...p} /><Path d="M5 7l-3 6.5a3.5 3.5 0 0 0 6 0zM19 7l-3 6.5a3.5 3.5 0 0 0 6 0z" {...p} /></>;
    case 'logout':
      return <><Path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" {...p} /><Path d="M10 17l-5-5 5-5M5 12h11" {...p} /></>;
    case 'refresh':
      return <><Path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.5" {...p} /><Path d="M20 3.5v5h-5" {...p} /></>;
    case 'tag':
      return <><Path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" {...p} /><Circle cx="7.5" cy="7.5" r="1.3" {...p} /></>;
    case 'lock':
      return <><Rect x="4" y="10" width="16" height="11" rx="2.5" {...p} /><Path d="M8 10V7a4 4 0 0 1 8 0v3" {...p} /></>;
    case 'inbox':
      return <><Path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" {...p} /><Path d="M3 13h5l1.5 2.5h5L16 13h5" {...p} /></>;
    default:
      return null;
  }
}
