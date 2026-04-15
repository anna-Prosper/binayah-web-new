import Link from "next/link";
import { Home, Search, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
              style={{ background: "linear-gradient(135deg, #1A7A5A20, #D4A84720)" }}
            >
              <span className="text-4xl font-bold text-[#1A7A5A]">404</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Page Not Found
            </h1>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              The page you're looking for doesn't exist or may have been moved.
              Let us help you find what you need.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
              >
                <Search className="h-4 w-4" />
                Search Properties
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Need help?{" "}
                <a
                  href="tel:+971549988811"
                  className="text-[#1A7A5A] hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  +971 54 998 8811
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
