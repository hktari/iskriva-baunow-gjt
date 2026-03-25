'use client';

import { createField, deleteField, updateField } from '@/server/actions/fields';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { FieldCategory } from '@prisma/client';
import { Check, Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Field {
  id: string;
  category: FieldCategory;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FieldsClientProps {
  fields: Record<FieldCategory, Field[]>;
}

const categoryLabels: Record<FieldCategory, string> = {
  PROJECT_TYPE: 'Project Types',
  INVESTMENT_TYPE: 'Investment Types',
  ORGANIZATION: 'Organizations',
  KPI_UNIT: 'KPI Units',
};

const categoryDescriptions: Record<FieldCategory, string> = {
  PROJECT_TYPE: 'Types of projects available in the system',
  INVESTMENT_TYPE: 'Investment classification types',
  ORGANIZATION: 'Partner organizations',
  KPI_UNIT: 'Units of measurement for KPIs',
};

export function FieldsClient({ fields: initialFields }: FieldsClientProps) {
  const [fields, setFields] = useState(initialFields);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingCategory, setAddingCategory] = useState<FieldCategory | null>(null);
  const [newValue, setNewValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (category: FieldCategory) => {
    if (!newValue.trim()) {
      toast.error('Value cannot be empty');
      return;
    }

    const result = await createField(category, newValue);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Field added successfully');
      const newField: Field = {
        id: result.fieldId!,
        category,
        value: newValue.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFields({
        ...fields,
        [category]: [...(fields[category] || []), newField].sort((a, b) =>
          a.value.localeCompare(b.value)
        ),
      });
      setNewValue('');
      setAddingCategory(null);
    }
  };

  const handleUpdate = async (id: string, category: FieldCategory) => {
    if (!editValue.trim()) {
      toast.error('Value cannot be empty');
      return;
    }

    const result = await updateField(id, editValue);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Field updated successfully');
      setFields({
        ...fields,
        [category]: fields[category]
          .map(f => (f.id === id ? { ...f, value: editValue.trim() } : f))
          .sort((a, b) => a.value.localeCompare(b.value)),
      });
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleDelete = async (id: string, category: FieldCategory) => {
    const result = await deleteField(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Field deleted successfully');
      setFields({
        ...fields,
        [category]: fields[category].filter(f => f.id !== id),
      });
    }
    setDeletingId(null);
  };

  const startEdit = (field: Field) => {
    setEditingId(field.id);
    setEditValue(field.value);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const categories = Object.keys(FieldCategory) as FieldCategory[];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{categoryLabels[category]}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {categoryDescriptions[category]}
                </p>
              </div>
              <Badge variant="secondary">{fields[category]?.length || 0}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields[category]?.map(field => (
              <div
                key={field.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50"
              >
                {editingId === field.id ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleUpdate(field.id, category);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleUpdate(field.id, category)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{field.value}</span>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(field)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeletingId(field.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            {addingCategory === category ? (
              <div className="flex items-center gap-2 p-2">
                <Input
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="Enter new value..."
                  className="flex-1"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAdd(category);
                    if (e.key === 'Escape') {
                      setAddingCategory(null);
                      setNewValue('');
                    }
                  }}
                />
                <Button size="icon" variant="ghost" onClick={() => handleAdd(category)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setAddingCategory(null);
                    setNewValue('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setAddingCategory(category)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {categoryLabels[category].slice(0, -1)}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this field value. Make sure
              it&apos;s not being used by any projects.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  const field = Object.values(fields)
                    .flat()
                    .find(f => f.id === deletingId);
                  if (field) {
                    handleDelete(deletingId, field.category);
                  }
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
