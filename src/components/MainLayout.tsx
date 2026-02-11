import { Upload, Library, Search, Sparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
    description: "Upload media files",
  },
  {
    title: "Library",
    href: "/library",
    icon: Library,
    description: "View all media",
  },
  {
    title: "Search",
    href: "/search",
    icon: Search,
    description: "Query your content",
  },
];

export default function MainLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 hidden md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 border-b px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/" className="flex h-16 items-center gap-2 ">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                MediaRAG
              </span>
            </NavLink>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                      isActive
                        ? "bg-muted text-primary"
                        : "text-muted-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="border-t border-border p-4">
            <div className="rounded-lg bg-sidebar-accent/50 p-4">
              <p className="text-xs text-muted-foreground">
                Upload media files and use AI-powered search to find relevant
                content in your transcripts.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
