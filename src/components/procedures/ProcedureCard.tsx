import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, Tag } from "lucide-react";
import { format } from "date-fns";

export default function ProcedureCard({ procedure, categories, onEdit, onDelete }) {
  const category = categories.find(c => c.id === procedure.category_id);
  
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    archived: "bg-slate-100 text-slate-800 border-slate-200"
  };

  const statusLabels = {
    active: "Ativo",
    draft: "Rascunho",
    archived: "Arquivado"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2 mb-2">
            <Badge className={statusColors[procedure.status]}>
              {statusLabels[procedure.status]}
            </Badge>
            {category && (
              <Badge variant="outline" className="text-xs">
                {category.name}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg line-clamp-2">{procedure.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 line-clamp-3">
            {procedure.summary || 'Sem resumo'}
          </p>

          {procedure.tags && procedure.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {procedure.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText className="w-3 h-3" />
            Versão {procedure.version || 1} • {procedure.updated_date && format(new Date(procedure.updated_date), "dd/MM/yyyy")}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(procedure)}
              className="flex-1 hover:bg-blue-50 hover:border-blue-300"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(procedure.id)}
              className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}