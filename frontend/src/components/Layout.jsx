import { Outlet } from "react-router";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import { MobileBottomNav } from "./MobileBottomNav.jsx";

function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-base-200 text-base-content">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-24 md:px-6 md:py-10 md:pb-10">
        <Outlet />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
export default Layout;
