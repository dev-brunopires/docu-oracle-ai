import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users as UsersIcon, Mail, Search, Shield, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-1">Visualize os usuários da plataforma</p>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Shield className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Para convidar novos usuários ou alterar permissões, use a funcionalidade de gestão de usuários no Dashboard → Configurações
          </AlertDescription>
        </Alert>

        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {user.full_name || 'Sem nome'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </div>
                  <Badge 
                    className={
                      user.role === 'admin' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-slate-100 text-slate-700'
                    }
                  >
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Usuário
                      </>
                    )}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-slate-500">Tente ajustar a busca</p>
          </div>
        )}
      </div>
    </div>
  );
}