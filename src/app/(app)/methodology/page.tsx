import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { BookOpen, ExternalLink, GraduationCap, Wrench } from 'lucide-react';

export const metadata = {
  title: 'Methodology | EU Project Manager',
  description:
    'Capacity building, tools and community support for RES and EE investments into green and livable communities',
};

const COMING_SOON = 'Available in January 2027';

interface MethodologyItem {
  title: string;
  description: string;
  href?: string;
  comingSoon?: boolean;
}

interface MethodologySection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  comingSoon?: boolean;
  items: MethodologyItem[];
}

const SECTIONS: MethodologySection[] = [
  {
    title:
      'Capacity building and knowledge in support of RES and EE investments into green and livable communities',
    icon: GraduationCap,
    items: [
      {
        title: 'Energy to Evolve',
        description:
          'Holistic MOOC on capacity building for RES and EE investment planning in support of the Green and Just Transition.',
        href: 'https://youtu.be/w_60Qb-4KHo',
      },
      {
        title: 'Higher education module framework',
        description:
          'A model higher education programme that builds understanding of the Green and Just Transition as an investment opportunity.',
        comingSoon: true,
      },
      {
        title: 'Angel investor capacity building',
        description:
          'Supports investor mobilisation at the local level through localised investment programmes.',
        comingSoon: true,
      },
    ],
  },
  {
    title: 'Tools and community support in RES and EE project development',
    icon: Wrench,
    comingSoon: true,
    items: [
      {
        title: 'Step-by-step guide',
        description:
          'Key principles of RES and EE investments in support of green and livable communities.',
      },
      {
        title: 'Library of support tools and best practices',
        description: '',
      },
      {
        title: 'Links to key relevant information sources',
        description: '',
      },
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Methodology</h1>
        </div>
        <p className="text-muted-foreground">
          Knowledge, tools and community support for planning and developing renewable energy (RES)
          and energy efficiency (EE) investments.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {SECTIONS.map(section => (
          <Card key={section.title} data-testid="methodology-section">
            <CardHeader>
              <div className="flex items-start gap-3">
                <section.icon className="h-5 w-5 mt-1 shrink-0 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl leading-snug">{section.title}</CardTitle>
                  {section.comingSoon ? (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {COMING_SOON}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                This section includes:
              </p>
              <ul className="flex flex-col gap-3">
                {section.items.map(item => (
                  <li key={item.title} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {item.title}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="font-semibold">{item.title}</span>
                      )}
                      {item.comingSoon ? (
                        <Badge variant="secondary" className="text-xs">
                          {COMING_SOON}
                        </Badge>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                        {item.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
