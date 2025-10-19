import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

import ProcedureCard from "../components/procedures/ProcedureCard";
import ProcedureForm from "../components/procedures/ProcedureForm";

export default function Procedures() {
  const [showForm, setShowForm] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const queryClient = useQueryClient();

  const { data: procedures, isLoading } = useQuery({
    queryKey: ['procedures'],
    queryFn: () => base44.entities.Procedure.list('-updated_date'),
    initialData: [],
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list(),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Procedure.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['procedures']);
    },
  });

  const filteredProcedures = procedures.filter(proc => {
    const matchesSearch = proc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proc.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (procedure) => {
    setEditingProcedure(procedure);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProcedure(null);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Procedimentos</h1>
            <p className="text-slate-500 mt-1">Gerencie os procedimentos da empresa</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Procedimento
          </Button>
        </div>

        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar procedimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="active">Ativos</TabsTrigger>
                  <TabsTrigger value="draft">Rascunhos</TabsTrigger>
                  <TabsTrigger value="archived">Arquivados</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProcedures.map((procedure) => (
                <ProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                  categories={categories}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredProcedures.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum procedimento encontrado</h3>
            <p className="text-slate-500">Tente ajustar os filtros ou criar um novo procedimento</p>
          </div>
        )}

        {showForm && (
          <ProcedureForm
            procedure={editingProcedure}
            categories={categories}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
}