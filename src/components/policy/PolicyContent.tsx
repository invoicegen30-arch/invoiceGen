'use client';

import { PolicySection } from '@/types/policy';
import Card from '@/components/ui/Card';

interface PolicyContentProps {
  sections: PolicySection[];
}

export default function PolicyContent({ sections }: PolicyContentProps) {
  return (
    <Card className="p-8" padding="md">
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="scroll-mt-24 mb-8 last:mb-0">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 first:mt-0">{s.title}</h2>
          {s.body && (
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              {s.body.split('\n\n').map((block, idx) => {
                const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
                const isList = lines.length > 1 && lines.every((l) => l.startsWith('•'));
                const isNumberedList = lines.length > 1 && lines.every((l) => /^\d+\./.test(l));
                
                if (isList) {
                  return (
                    <ul key={idx} className="list-disc pl-6 space-y-2">
                      {lines.map((l, i) => (
                        <li key={i} className="leading-relaxed">{l.replace(/^•\s?/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                
                if (isNumberedList) {
                  return (
                    <ol key={idx} className="list-decimal pl-6 space-y-2">
                      {lines.map((l, i) => (
                        <li key={i} className="leading-relaxed">{l.replace(/^\d+\.\s?/, '')}</li>
                      ))}
                    </ol>
                  );
                }
                
                return <p key={idx} className="leading-relaxed">{block}</p>;
              })}
            </div>
          )}
        </section>
      ))}
    </Card>
  );
}
