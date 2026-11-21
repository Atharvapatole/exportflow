import React from 'react';
import { BaseDocument } from '@/types';
import { ClassicCorporateTemplate } from './templates/ClassicCorporate';
import { ModernMinimalTemplate } from './templates/ModernMinimal';
import { InternationalTradeTemplate } from './templates/InternationalTrade';
import { PremiumProfessionalTemplate, CompactBusinessTemplate } from './templates/PremiumProfessional';

export function DocumentRenderer({ doc }: { doc: BaseDocument }) {
  const templateId = doc.templateId || 'classic-corporate';

  switch (templateId) {
    case 'modern-minimal':
      return <ModernMinimalTemplate doc={doc} />;
    case 'international-trade':
      return <InternationalTradeTemplate doc={doc} />;
    case 'premium-professional':
      return <PremiumProfessionalTemplate doc={doc} />;
    case 'compact-business':
      return <CompactBusinessTemplate doc={doc} />;
    case 'classic-corporate':
    default:
      return <ClassicCorporateTemplate doc={doc} />;
  }
}
