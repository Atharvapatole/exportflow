import React from 'react';
import { BaseDocument } from '@/types';
import { ClassicCorporateTemplate } from './templates/ClassicCorporate';
import { ModernMinimalTemplate } from './templates/ModernMinimal';
import { InternationalTradeTemplate } from './templates/InternationalTrade';
import { PremiumInternationalTemplate } from './templates/PremiumInternational';
import { CompactBusinessTemplate } from './templates/CompactBusiness';

export function DocumentRenderer({ doc }: { doc: BaseDocument }) {
  const templateId = doc.templateId || 'classic-corporate';

  switch (templateId) {
    case 'modern-minimal':
      return <ModernMinimalTemplate doc={doc} />;
    case 'international-trade':
      return <InternationalTradeTemplate doc={doc} />;
    case 'premium-international':
    case 'premium-professional':
      return <PremiumInternationalTemplate doc={doc} />;
    case 'compact-business':
      return <CompactBusinessTemplate doc={doc} />;
    case 'classic-corporate':
    default:
      return <ClassicCorporateTemplate doc={doc} />;
  }
}
