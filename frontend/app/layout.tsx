import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthModalProvider } from "@/hooks/useAuthModal";
import { CartProvider } from "@/hooks/useCart";
import { LanguageProvider } from "@/lib/i18n";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToastHost } from "@/components/ui/Toast";
import { AuthModal } from "@/components/auth/AuthModal";
import { ApiWarmup } from "@/components/layout/ApiWarmup";
import { PageTransition } from "@/components/motion/PageTransition";
import { WelcomeSplash } from "@/components/home/WelcomeSplash";
import { Suspense } from "react";

export const metadata = {
  title: "Nurov Marketplace",
  description: "Trusted marketplace for buyers and sellers",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tg">
      <body className="min-h-dvh pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <LanguageProvider>
          <AuthProvider>
            <AuthModalProvider>
            <CartProvider>
              <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-3 focus:py-2 focus:text-white">
                Skip to content
              </a>
              <Header />
              <main id="main">
                <Suspense>
                  <Breadcrumbs />
                </Suspense>
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <BottomNav />
              <ToastHost />
              <ApiWarmup />
              <AuthModal />
              <Suspense fallback={null}>
                <WelcomeSplash />
              </Suspense>
            </CartProvider>
            </AuthModalProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
