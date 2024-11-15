import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import { Roboto } from 'next/font/google';

export const metadata = getMetadata({ title: "YouSplit", description: "Splitter contract for YouTube royalties" });

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'], // Regular and Bold
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html className={`${roboto.className}`} suppressHydrationWarning>
      <body className="bg-white text-black">
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
