import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  LogOut,
  Menu,
  Sparkles
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: proceduresCount } = useQuery({
    queryKey: ['procedures-count'],
    queryFn: async () => {
      const procedures = await base44.entities.Procedure.list();
      return procedures.filter(p => p.status === 'active').length;
    },
    initialData: 0,
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navigationItems = [
    {
      title: "Chat",
      url: createPageUrl("Chat"),
      icon: MessageSquare,
      badge: null
    },
    ...(user?.role === 'admin' ? [
      {
        title: "Procedimentos",
        url: createPageUrl("Procedures"),
        icon: BookOpen,
        badge: proceduresCount > 0 ? proceduresCount : null
      },
      {
        title: "Usuários",
        url: createPageUrl("Users"),
        icon: Users,
        badge: null
      }
    ] : [])
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Oráculo</h2>
                <p className="text-xs text-slate-500">Procedimentos IA</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-1">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:text-white shadow-md' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto bg-white/20 text-current border-0">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900">Oráculo</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}