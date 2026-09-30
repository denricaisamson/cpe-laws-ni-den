import React from 'react';
import { FinancialReportingClient } from './FinancialReportingClient';

export const metadata = {
  title: 'Financial Summary & Reports | FSL Admin Console',
  description: 'Audited financial overview, revenue breakdown by FSL Level, class section analysis, and transaction ledger.',
};

export default function FinancePage() {
  return <FinancialReportingClient />;
}
