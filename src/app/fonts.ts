import { Inter } from "next/font/google";
import localFont from 'next/font/local';

// Define Inter with its variable
export const inter = Inter({ subsets: ["latin"], variable: '--font-inter', display: 'swap' });

// Configure the local font with multiple weights
export const fkGrotesk = localFont({
  src: [
    {
      path: '../fonts/fk-grotesk-neue/Light.otf',
      weight: '300', // Standard weight for Light
      style: 'normal',
    },
    {
      path: '../fonts/fk-grotesk-neue/Regular.otf',
      weight: '400', // Standard weight for Regular
      style: 'normal',
    },
  ],
  variable: '--font-fk-grotesk',
  display: 'swap',
}); 