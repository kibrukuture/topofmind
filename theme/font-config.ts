import {
  Architects_Daughter,
  DM_Sans,
  Fira_Code,
  Geist,
  Geist_Mono,
  Instrument_Sans,
  Inter,
  Mulish,
  Noto_Sans_Mono,
  Outfit,
  Space_Mono
} from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/ui/utils';

// Parafina (local) — geometric sans, single weight (Black); path relative to this file
const fontParafina = localFont({
  src: '../public/fonts/parafina_black.ttf',
  weight: '900',
  style: 'normal',
  display: 'swap',
  variable: '--font-parafina',
  fallback: ['system-ui', 'sans-serif'],
});

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans'
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
});

const fontInstrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument'
});

const fontNotoMono = Noto_Sans_Mono({
  subsets: ['latin'],
  variable: '--font-noto-mono'
});

const fontMullish = Mulish({
  subsets: ['latin'],
  variable: '--font-mullish'
});

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const fontArchitectsDaughter = Architects_Daughter({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-architects-daughter'
});

const fontDMSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans'
});

const fontFiraCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code'
});

const fontOutfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit'
});

const fontSpaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono'
});

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontInstrument.variable,
  fontNotoMono.variable,
  fontMullish.variable,
  fontInter.variable,
  fontArchitectsDaughter.variable,
  fontDMSans.variable,
  fontFiraCode.variable,
  fontOutfit.variable,
  fontSpaceMono.variable,
  fontParafina.variable
);

/** Parafina local font — use via className={fontParafina.className} or CSS var(--font-parafina) */
export { fontParafina };
