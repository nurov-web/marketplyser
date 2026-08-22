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
import { Suspense } from "react";

export const metadata = {
  title: "Nurov Marketplace",
  description: "Trusted marketplace for buyers and sellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tg">
      <body className="min-h-dvh pb-16 md:pb-0">
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
                {children}
              </main>
              <Footer />
              <BottomNav />
              <ToastHost />
              <AuthModal />
            </CartProvider>
            </AuthModalProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
