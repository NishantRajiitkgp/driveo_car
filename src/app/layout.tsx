import type { Metadata } from 'next';
import Script from 'next/script';
import { Anton, Inter, JetBrains_Mono, Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DRIVEO — Mobile Car Detailing Across the GTA | We Come to You',
  description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever. Serving Etobicoke, Mississauga, and the Greater Toronto Area.',
  keywords: ['car detailing', 'mobile car wash', 'GTA', 'Etobicoke', 'Mississauga', 'condo car wash'],
  openGraph: {
    title: 'DRIVEO — Mobile Car Detailing Across the GTA',
    description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${poppins.variable}`}>
      <body>
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
