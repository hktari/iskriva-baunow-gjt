'use client';

import { ProjectForm } from '@/shared/components/projects/project-form';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { formatCurrency, formatDate, getStatusLabel } from '@/shared/lib/formatters';
import { Building2, Calendar, DollarSign, ExternalLink, FileText, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

interface ProjectDetailViewProps {
  project: any;
  configurableFields: any;
  canEdit: boolean;
  isAuthenticated: boolean;
}

export function ProjectDetailView({
  project,
  configurableFields,
  canEdit,
  isAuthenticated,
}: ProjectDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Project</h2>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <ProjectForm
          project={project}
          configurableFields={configurableFields}
          isEdit
          isAuthenticated={isAuthenticated}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canEdit ? (
        <div className="flex justify-end">
          <Button onClick={() => setIsEditing(true)}>Edit Project</Button>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Basic information about the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Country</span>
              <p className="font-medium">{project.country}</p>
            </div>

            {project.organization ? (
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Organization
                </span>
                <p className="font-medium">{project.organization}</p>
              </div>
            ) : null}

            <div>
              <span className="text-sm text-muted-foreground">Project Type</span>
              <p className="font-medium">{project.projectType}</p>
            </div>

            {project.investmentType ? (
              <div>
                <span className="text-sm text-muted-foreground">Investment Type</span>
                <p className="font-medium">{project.investmentType}</p>
              </div>
            ) : null}

            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="mt-1">
                <Badge variant="secondary">{getStatusLabel(project.status)}</Badge>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Project Value
              </span>
              <p className="font-medium">{formatCurrency(project.projectValue)}</p>
            </div>

            {project.investmentCosts ? (
              <div>
                <span className="text-sm text-muted-foreground">Investment Costs</span>
                <p className="font-medium">{formatCurrency(project.investmentCosts)}</p>
              </div>
            ) : null}

            <div>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Start Date
              </span>
              <p className="font-medium">{formatDate(project.startDate)}</p>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">End Date</span>
              <p className="font-medium">
                {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
              </p>
            </div>

            <div className="col-span-full">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Description
              </span>
              <p className="mt-1">{project.description}</p>
            </div>

            {project.lastEdited ? (
              <div className="col-span-full text-sm text-muted-foreground">
                Last edited: {formatDate(project.lastEdited)}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Optional details about the project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.program ? (
              <div>
                <span className="text-sm text-muted-foreground">Programme</span>
                <p className="font-medium">{project.program}</p>
              </div>
            ) : null}

            {project.projectManager ? (
              <div>
                <span className="text-sm text-muted-foreground">Project Manager</span>
                <p className="font-medium">{project.projectManager}</p>
              </div>
            ) : null}

            {project.contact ? (
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Contact Email
                </span>
                <a
                  href={`mailto:${project.contact}`}
                  className="font-medium text-primary hover:underline"
                >
                  {project.contact}
                </a>
              </div>
            ) : null}

            {project.projectWebsite ? (
              <div>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Project Website
                </span>
                <a
                  href={project.projectWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ) : null}

            {project.targetGroup && project.targetGroup.length > 0 ? (
              <div className="col-span-full">
                <span className="text-sm text-muted-foreground">Target Group</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.targetGroup.map((group: string) => (
                    <Badge key={group} variant="outline">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {project.impact && project.impact.length > 0 ? (
              <div className="col-span-full">
                <span className="text-sm text-muted-foreground">Impact Areas</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {project.impact.map((impact: string) => (
                    <Badge key={impact} variant="outline">
                      {impact}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {isAuthenticated && project.note ? (
              <div className="col-span-full">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Internal Note
                </span>
                <p className="mt-1 p-3 bg-muted rounded-md">{project.note}</p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
