import React from 'react';
import { PaymentsVerificationClient } from './PaymentsVerificationClient';

export const metadata = {
  title: 'Payment Verification Queue | FSL Admin Console',
  description: 'Review simulated learner fee submissions, verify payments, and atomically activate course enrollments.',
};

export default function PaymentsPage() {
  return <PaymentsVerificationClient />;
}
