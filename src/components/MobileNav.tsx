
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Map, Ticket, Settings, LogIn, UserPlus, Home, ChevronRight } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  isLoggedIn: boolean;
}

const MobileNav = ({ isOpen, isLoggedIn }: MobileNavProps) => {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem("adminAuth");

  return (
    <div
      className={cn(
        "fixed inset-0 top-[60px] z-50 flex flex-col bg-white/95 dark:bg-black/95 pt-4 pb-20 backdrop-blur-lg md:hidden",
        isOpen ? "animate-fade-in" : "hidden"
      )}
    >
      <div className="container flex-1 overflow-auto px-4">
        <nav className="flex flex-col gap-4">
          <Link
            to="/"
            className="flex items-center justify-between py-4 text-lg font-medium border-b border-border"
          >
            <span className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Home
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/events"
            className="flex items-center justify-between py-4 text-lg font-medium border-b border-border"
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Events
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="py-2 text-sm font-medium text-muted-foreground">Venues</div>
          <Link
            to="/venue/1"
            className="flex items-center justify-between py-2 pl-4 text-base"
          >
            <span className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Featured Venue
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/venue/2"
            className="flex items-center justify-between py-2 pl-4 text-base"
          >
            <span className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Concert Halls
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/venue/3"
            className="flex items-center justify-between py-2 pl-4 text-base"
          >
            <span className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Conference Centers
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            to="/venue/4"
            className="flex items-center justify-between py-2 pl-4 text-base"
          >
            <span className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Sports Arenas
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          
          {isLoggedIn || isAdmin ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center justify-between py-4 text-lg font-medium border-b border-border"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Admin Dashboard
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center justify-between py-4 text-lg font-medium border-b border-border"
              >
                <span className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  My Tickets
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/profile/settings"
                className="flex items-center justify-between py-4 text-lg font-medium border-b border-border"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-8">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/login")}>
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button className="w-full justify-start gap-2" onClick={() => navigate("/login?tab=register")}>
                <UserPlus className="h-4 w-4" />
                Register
              </Button>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileNav;
