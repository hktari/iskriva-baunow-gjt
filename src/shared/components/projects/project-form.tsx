'use client';

import { createProject, updateProject } from '@/server/actions/projects';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  IMPACT_AREAS,
  PROGRAMS,
  PROJECT_COUNTRIES,
  PROJECT_STATUSES,
  TARGET_GROUPS,
} from '@/shared/lib/constants';
import { Info, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const NONE_OPTION_VALUE = '__none__';

interface ProjectFormProps {
  project?: any;
  configurableFields: {
    PROJECT_TYPE?: string[];
    INVESTMENT_TYPE?: string[];
    ORGANIZATION?: string[];
  };
  isEdit?: boolean;
  isAuthenticated: boolean;
}

export function ProjectForm({
  project,
  configurableFields,
  isEdit = false,
  isAuthenticated,
}: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState<string[]>(
    project?.targetGroup ?? []
  );
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(project?.impact ?? []);

  const normalizeOptionalSelectValue = (value: FormDataEntryValue | null) => {
    if (typeof value !== 'string' || value === NONE_OPTION_VALUE) {
      return null;
    }

    return value;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      projectType: formData.get('projectType') as string,
      investmentType: normalizeOptionalSelectValue(formData.get('investmentType')),
      projectValue: parseFloat(formData.get('projectValue') as string),
      investmentCosts: formData.get('investmentCosts')
        ? parseFloat(formData.get('investmentCosts') as string)
        : null,
      status: formData.get('status') as 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD',
      startDate: new Date(formData.get('startDate') as string),
      endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string) : null,
      description: formData.get('description') as string,
      note: (formData.get('note') as string) ?? null,
      projectManager: (formData.get('projectManager') as string) ?? null,
      contact: (formData.get('contact') as string) ?? null,
      projectWebsite: (formData.get('projectWebsite') as string) ?? null,
      program: normalizeOptionalSelectValue(formData.get('program')),
      organization: normalizeOptionalSelectValue(formData.get('organization')),
      targetGroup: selectedTargetGroups,
      impact: selectedImpacts,
    };

    try {
      const result =
        isEdit && project ? await updateProject(project.id, data) : await createProject(data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? 'Project updated successfully' : 'Project created successfully');
        router.push(`/project/${result.projectId}`);
        router.refresh();
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTargetGroup = (group: string) => {
    setSelectedTargetGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const toggleImpact = (impact: string) => {
    setSelectedImpacts(prev =>
      prev.includes(impact) ? prev.filter(i => i !== impact) : [...prev, impact]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Basic information about the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" name="name" defaultValue={project?.name} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select name="country" defaultValue={project?.country} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">
                Organization
                <Info className="inline h-3 w-3 ml-1 text-muted-foreground" />
              </Label>
              <Select name="organization" defaultValue={project?.organization ?? NONE_OPTION_VALUE}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION_VALUE}>None</SelectItem>
                  {configurableFields.ORGANIZATION?.map(org => (
                    <SelectItem key={org} value={org}>
                      {org}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type *</Label>
              <Select name="projectType" defaultValue={project?.projectType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {configurableFields.PROJECT_TYPE?.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentType">Investment Type</Label>
              <Select
                name="investmentType"
                defaultValue={project?.investmentType ?? NONE_OPTION_VALUE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OPTION_VALUE}>None</SelectItem>
                  {configurableFields.INVESTMENT_TYPE?.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select name="status" defaultValue={project?.status ?? 'PLANNING'} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectValue">
                Project Value (EUR) *
                <Info className="inline h-3 w-3 ml-1 text-muted-foreground" />
              </Label>
              <Input
                id="projectValue"
                name="projectValue"
                type="number"
                step="0.01"
                defaultValue={project?.projectValue}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentCosts">Investment Costs (EUR)</Label>
              <Input
                id="investmentCosts"
                name="investmentCosts"
                type="number"
                step="0.01"
                defaultValue={project?.investmentCosts ?? ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={
                  project?.startDate
                    ? (new Date(project.startDate).toISOString().split('T')[0] ?? '')
                    : ''
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={
                  project?.endDate
                    ? (new Date(project.endDate).toISOString().split('T')[0] ?? '')
                    : ''
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={project?.description}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Optional details about the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program">Programme</Label>
            <Select name="program" defaultValue={project?.program ?? NONE_OPTION_VALUE}>
              <SelectTrigger>
                <SelectValue placeholder="Select programme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_OPTION_VALUE}>None</SelectItem>
                {PROGRAMS.map(program => (
                  <SelectItem key={program} value={program}>
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectManager">Project Manager</Label>
              <Input
                id="projectManager"
                name="projectManager"
                defaultValue={project?.projectManager ?? ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                name="contact"
                type="email"
                defaultValue={project?.contact ?? ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectWebsite">Project Website</Label>
            <Input
              id="projectWebsite"
              name="projectWebsite"
              type="url"
              defaultValue={project?.projectWebsite ?? ''}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Group</Label>
            <div className="flex flex-wrap gap-2">
              {TARGET_GROUPS.map(group => (
                <Badge
                  key={group}
                  variant={selectedTargetGroups.includes(group) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTargetGroup(group)}
                >
                  {group}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Impact Areas</Label>
            <div className="flex flex-wrap gap-2">
              {IMPACT_AREAS.map(impact => (
                <Badge
                  key={impact}
                  variant={selectedImpacts.includes(impact) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleImpact(impact)}
                >
                  {impact}
                </Badge>
              ))}
            </div>
          </div>

          {isAuthenticated ? (
            <div className="space-y-2">
              <Label htmlFor="note" className="flex items-center gap-2">
                Internal Note
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Textarea
                id="note"
                name="note"
                rows={3}
                defaultValue={project?.note ?? ''}
                placeholder="Visible only to authenticated users"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
