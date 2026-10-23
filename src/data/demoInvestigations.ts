import type { Investigation } from '../types/investigation';

// Demo data — illustrative only. Does not represent real employers or real findings.
export const demoInvestigations: Investigation[] = [
  {
    id: 'inv-001',
    jobTitle: 'Software Engineer (Remote)',
    employer: 'GlobalTech Solutions',
    location: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '₹60,000–₹90,000 / month',
    sourceUrl: '',
    sourceDescription:
      'Full-stack Software Engineer role posted on a third-party job board. Requirements include 3+ years of React and Node.js experience.',
    submittedAt: '2026-10-20T10:32:00Z',
    riskLevel: 'low',
    assessmentLabel: 'Lower Risk',
    assessmentSummary:
      'Company domain matches recruiter email. No upfront fees requested. Job description is detailed and consistent.',
    signals: [
      { id: 's1', label: 'Domain match', description: 'Recruiter email aligns with company domain.', weight: 0.05, flagged: false },
      { id: 's2', label: 'Detailed JD', description: 'Job description includes specific technical requirements.', weight: 0.05, flagged: false },
      { id: 's3', label: 'No fee request', description: 'No mention of upfront payments.', weight: 0.05, flagged: false },
      { id: 's4', label: 'Verifiable employer', description: 'Company has public online presence.', weight: 0.15, flagged: false },
    ],
  },
  {
    id: 'inv-002',
    jobTitle: 'Product Designer',
    employer: 'RapidTech Solutions',
    location: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '₹80,000–₹1,20,000 / month',
    sourceUrl: '',
    sourceDescription:
      'Product Designer role. Minimal job description. Requires payment of ₹2,000 as a "registration fee" before the interview.',
    submittedAt: '2026-10-19T14:15:00Z',
    riskLevel: 'high',
    assessmentLabel: 'Suspicious',
    assessmentSummary:
      'Multiple warning signs detected. Review the evidence and verify the details independently.',
    signals: [
      { id: 's1', label: 'Payment fee', description: 'Mentions an upfront registration fee of ₹2,000.', weight: 0.42, flagged: true },
      { id: 's2', label: 'Personal email', description: 'Recruiter is using a personal Gmail instead of a company domain.', weight: 0.28, flagged: true },
      { id: 's3', label: 'Urgent hiring', description: 'Pressures for immediate acceptance without process.', weight: 0.18, flagged: true },
      { id: 's4', label: 'Positive signals', description: 'Some job details present but incomplete.', weight: 0.12, flagged: false },
    ],
  },
  {
    id: 'inv-003',
    jobTitle: 'Marketing Intern',
    employer: 'Skyline Media',
    location: 'Hybrid — Bangalore',
    employmentType: 'Internship',
    salaryRange: '₹8,000–₹12,000 / month',
    sourceUrl: '',
    sourceDescription:
      'Marketing internship. Company details partially verifiable. Recruiter email domain is different from company website.',
    submittedAt: '2026-10-18T09:00:00Z',
    riskLevel: 'medium',
    assessmentLabel: 'Needs Review',
    assessmentSummary:
      'Some inconsistencies found. Verify the employer independently before proceeding.',
    signals: [
      { id: 's1', label: 'Domain mismatch', description: 'Recruiter email domain differs from company website.', weight: 0.30, flagged: true },
      { id: 's2', label: 'Unverified employer', description: 'Company details could not be fully confirmed.', weight: 0.35, flagged: true },
      { id: 's3', label: 'No fee request', description: 'No mention of upfront payments.', weight: 0.10, flagged: false },
      { id: 's4', label: 'Vague description', description: 'Role responsibilities are unclear.', weight: 0.25, flagged: true },
    ],
  },
];

// Simulate an investigation by randomly varying signals for demo purposes
export function simulateInvestigation(formData: { jobUrl: string; jobDescription: string }): Promise<Investigation> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hasPaymentKeyword =
        formData.jobDescription.toLowerCase().includes('fee') ||
        formData.jobDescription.toLowerCase().includes('payment') ||
        formData.jobDescription.toLowerCase().includes('deposit');
      const hasUrgentKeyword =
        formData.jobDescription.toLowerCase().includes('urgent') ||
        formData.jobDescription.toLowerCase().includes('immediately');

      const riskLevel = hasPaymentKeyword ? 'high' : hasUrgentKeyword ? 'medium' : 'low';
      const assessmentLabel =
        riskLevel === 'high' ? 'Suspicious' : riskLevel === 'medium' ? 'Needs Review' : 'Lower Risk';

      const result: Investigation = {
        id: `inv-${Date.now()}`,
        jobTitle: 'Analysed Role',
        employer: 'Submitted Employer',
        location: 'Unknown',
        employmentType: 'Unknown',
        salaryRange: undefined,
        sourceUrl: formData.jobUrl || undefined,
        sourceDescription: formData.jobDescription,
        submittedAt: new Date().toISOString(),
        riskLevel,
        assessmentLabel,
        assessmentSummary:
          riskLevel === 'high'
            ? 'Multiple warning signs detected. Review the evidence and verify the details independently.'
            : riskLevel === 'medium'
            ? 'Some inconsistencies found. Verify the employer independently before proceeding.'
            : 'No major red flags detected. Continue due diligence before accepting any offer.',
        signals: [
          {
            id: 's1',
            label: 'Payment fee',
            description: hasPaymentKeyword ? 'Mentions an upfront fee or payment.' : 'No fee mention detected.',
            weight: hasPaymentKeyword ? 0.42 : 0.05,
            flagged: hasPaymentKeyword,
          },
          {
            id: 's2',
            label: 'Personal email',
            description: 'Could not verify recruiter email domain.',
            weight: 0.18,
            flagged: riskLevel === 'high',
          },
          {
            id: 's3',
            label: 'Urgent hiring',
            description: hasUrgentKeyword ? 'Urgency language detected.' : 'No urgency language detected.',
            weight: hasUrgentKeyword ? 0.22 : 0.05,
            flagged: hasUrgentKeyword,
          },
          {
            id: 's4',
            label: 'Positive signals',
            description: 'Some legitimate signals are present.',
            weight: 0.15,
            flagged: false,
          },
        ],
      };
      resolve(result);
    }, 2000);
  });
}
