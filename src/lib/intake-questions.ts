// Context Intake Agent Questions
// Max 15 questions covering: industry, headcount, geography, data types, cloud stack, customer types

export interface IntakeQuestion {
  id: string
  question: string
  description?: string
  type: 'text' | 'select' | 'multi-select' | 'number' | 'textarea'
  options?: { value: string; label: string }[]
  placeholder?: string
  required: boolean
  category: 'organization' | 'data' | 'technology' | 'compliance' | 'customers'
}

export const intakeQuestions: IntakeQuestion[] = [
  // Organization context (4 questions)
  {
    id: 'org_name',
    question: 'What is your organization name?',
    description: 'Legal name of your organization',
    type: 'text',
    placeholder: 'Acme Corporation',
    required: true,
    category: 'organization'
  },
  {
    id: 'industry',
    question: 'What industry does your organization operate in?',
    description: 'Primary business sector',
    type: 'select',
    options: [
      { value: 'technology', label: 'Technology / Software' },
      { value: 'fintech', label: 'Financial Technology (FinTech)' },
      { value: 'healthcare', label: 'Healthcare / HealthTech' },
      { value: 'financial_services', label: 'Financial Services / Banking' },
      { value: 'ecommerce', label: 'E-commerce / Retail' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'professional_services', label: 'Professional Services / Consulting' },
      { value: 'education', label: 'Education / EdTech' },
      { value: 'government', label: 'Government / Public Sector' },
      { value: 'media', label: 'Media / Entertainment' },
      { value: 'other', label: 'Other' }
    ],
    required: true,
    category: 'organization'
  },
  {
    id: 'headcount',
    question: 'How many employees does your organization have?',
    description: 'Total headcount including contractors',
    type: 'select',
    options: [
      { value: '1-10', label: '1-10 employees' },
      { value: '11-50', label: '11-50 employees' },
      { value: '51-100', label: '51-100 employees' },
      { value: '101-200', label: '101-200 employees' },
      { value: '201-500', label: '201-500 employees' },
      { value: '501-1000', label: '501-1000 employees' },
      { value: '1000+', label: '1000+ employees' }
    ],
    required: true,
    category: 'organization'
  },
  {
    id: 'geography',
    question: 'Where are your primary operations located?',
    description: 'Select all regions where you have significant operations',
    type: 'multi-select',
    options: [
      { value: 'north_america', label: 'North America' },
      { value: 'europe', label: 'Europe (EU/UK)' },
      { value: 'asia_pacific', label: 'Asia Pacific' },
      { value: 'middle_east', label: 'Middle East' },
      { value: 'latin_america', label: 'Latin America' },
      { value: 'africa', label: 'Africa' },
      { value: 'australia', label: 'Australia / New Zealand' }
    ],
    required: true,
    category: 'organization'
  },

  // Data types handled (2 questions)
  {
    id: 'data_types',
    question: 'What types of sensitive data does your organization handle?',
    description: 'Select all that apply - this determines regulatory requirements',
    type: 'multi-select',
    options: [
      { value: 'pii', label: 'Personal Identifiable Information (PII)' },
      { value: 'phi', label: 'Protected Health Information (PHI)' },
      { value: 'financial', label: 'Financial / Payment Card Data' },
      { value: 'intellectual_property', label: 'Intellectual Property / Trade Secrets' },
      { value: 'customer_data', label: 'Customer Business Data' },
      { value: 'employee_data', label: 'Employee HR Data' },
      { value: 'authentication', label: 'Authentication Credentials' },
      { value: 'none', label: 'No sensitive data' }
    ],
    required: true,
    category: 'data'
  },
  {
    id: 'data_volume',
    question: 'Approximately how many customer/user records do you manage?',
    description: 'This helps scope your data protection requirements',
    type: 'select',
    options: [
      { value: 'less_1000', label: 'Less than 1,000' },
      { value: '1000_10000', label: '1,000 - 10,000' },
      { value: '10000_100000', label: '10,000 - 100,000' },
      { value: '100000_1m', label: '100,000 - 1 million' },
      { value: '1m_plus', label: 'More than 1 million' }
    ],
    required: true,
    category: 'data'
  },

  // Technology stack (4 questions)
  {
    id: 'cloud_providers',
    question: 'Which cloud platforms do you use?',
    description: 'Select all that apply',
    type: 'multi-select',
    options: [
      { value: 'aws', label: 'Amazon Web Services (AWS)' },
      { value: 'azure', label: 'Microsoft Azure' },
      { value: 'gcp', label: 'Google Cloud Platform' },
      { value: 'google_workspace', label: 'Google Workspace' },
      { value: 'microsoft_365', label: 'Microsoft 365' },
      { value: 'heroku', label: 'Heroku' },
      { value: 'vercel', label: 'Vercel' },
      { value: 'digitalocean', label: 'DigitalOcean' },
      { value: 'on_premise', label: 'On-premise / Self-hosted' },
      { value: 'other', label: 'Other' }
    ],
    required: true,
    category: 'technology'
  },
  {
    id: 'primary_workspace',
    question: 'What is your primary collaboration platform?',
    description: 'Where your team communicates and shares documents',
    type: 'select',
    options: [
      { value: 'google_workspace', label: 'Google Workspace (Gmail, Drive, Docs)' },
      { value: 'microsoft_365', label: 'Microsoft 365 (Outlook, SharePoint, Teams)' },
      { value: 'slack_based', label: 'Slack + Other tools' },
      { value: 'notion', label: 'Notion' },
      { value: 'other', label: 'Other' }
    ],
    required: true,
    category: 'technology'
  },
  {
    id: 'development_practices',
    question: 'Do you develop software or applications?',
    description: 'This determines which technical controls are relevant',
    type: 'select',
    options: [
      { value: 'yes_internal', label: 'Yes - We build software for internal use' },
      { value: 'yes_external', label: 'Yes - We build software for customers (SaaS/product)' },
      { value: 'yes_both', label: 'Yes - Both internal and customer-facing' },
      { value: 'no', label: 'No - We use third-party software only' }
    ],
    required: true,
    category: 'technology'
  },
  {
    id: 'remote_work',
    question: 'What is your work arrangement?',
    description: 'This affects physical and endpoint security controls',
    type: 'select',
    options: [
      { value: 'fully_remote', label: 'Fully remote (no office)' },
      { value: 'hybrid', label: 'Hybrid (office + remote)' },
      { value: 'office_only', label: 'Office-based only' }
    ],
    required: true,
    category: 'technology'
  },

  // Compliance drivers (3 questions)
  {
    id: 'compliance_drivers',
    question: 'What is driving your ISO 27001 certification?',
    description: 'Select all that apply',
    type: 'multi-select',
    options: [
      { value: 'customer_requirement', label: 'Customer/Contract requirement' },
      { value: 'enterprise_sales', label: 'Enterprise sales enablement' },
      { value: 'regulatory', label: 'Regulatory requirement' },
      { value: 'risk_management', label: 'Proactive risk management' },
      { value: 'competitive', label: 'Competitive advantage' },
      { value: 'investor', label: 'Investor/Board requirement' },
      { value: 'insurance', label: 'Cyber insurance requirement' }
    ],
    required: true,
    category: 'compliance'
  },
  {
    id: 'existing_certifications',
    question: 'Do you have any existing security certifications or frameworks?',
    description: 'Select all that apply',
    type: 'multi-select',
    options: [
      { value: 'soc2', label: 'SOC 2' },
      { value: 'iso27001_old', label: 'ISO 27001 (previous version)' },
      { value: 'hipaa', label: 'HIPAA' },
      { value: 'pci_dss', label: 'PCI DSS' },
      { value: 'gdpr', label: 'GDPR compliance program' },
      { value: 'nist', label: 'NIST CSF' },
      { value: 'none', label: 'None' }
    ],
    required: true,
    category: 'compliance'
  },
  {
    id: 'certification_timeline',
    question: 'What is your target timeline for ISO 27001 certification?',
    description: 'When do you need to be audit-ready?',
    type: 'select',
    options: [
      { value: '3_months', label: '3 months or less' },
      { value: '6_months', label: '3-6 months' },
      { value: '12_months', label: '6-12 months' },
      { value: 'no_rush', label: 'No specific timeline' }
    ],
    required: true,
    category: 'compliance'
  },

  // Customer context (2 questions)
  {
    id: 'customer_types',
    question: 'Who are your primary customers?',
    description: 'This helps determine interested parties and requirements',
    type: 'multi-select',
    options: [
      { value: 'enterprise', label: 'Enterprise (Fortune 500, large corporations)' },
      { value: 'smb', label: 'Small & Medium Business' },
      { value: 'startups', label: 'Startups' },
      { value: 'government', label: 'Government / Public Sector' },
      { value: 'consumers', label: 'Individual Consumers (B2C)' },
      { value: 'healthcare', label: 'Healthcare Organizations' },
      { value: 'financial', label: 'Financial Institutions' }
    ],
    required: true,
    category: 'customers'
  },
  {
    id: 'customer_security_requirements',
    question: 'Do your customers typically require security questionnaires or audits?',
    description: 'This indicates the level of security scrutiny you face',
    type: 'select',
    options: [
      { value: 'frequently', label: 'Yes, frequently (multiple per month)' },
      { value: 'sometimes', label: 'Sometimes (a few per quarter)' },
      { value: 'rarely', label: 'Rarely (once or twice a year)' },
      { value: 'never', label: 'Never' }
    ],
    required: true,
    category: 'customers'
  }
]

export const questionCategories = [
  { id: 'organization', label: 'Organization Profile', icon: 'Building2' },
  { id: 'data', label: 'Data & Information', icon: 'Database' },
  { id: 'technology', label: 'Technology Stack', icon: 'Server' },
  { id: 'compliance', label: 'Compliance Goals', icon: 'Shield' },
  { id: 'customers', label: 'Customer Context', icon: 'Users' }
] as const

export type QuestionCategory = typeof questionCategories[number]['id']

export function getQuestionsByCategory(category: QuestionCategory): IntakeQuestion[] {
  return intakeQuestions.filter(q => q.category === category)
}

export function calculateProgress(responses: Record<string, unknown>): number {
  const answeredCount = intakeQuestions.filter(q => {
    const response = responses[q.id]
    if (q.type === 'multi-select') {
      return Array.isArray(response) && response.length > 0
    }
    return response !== undefined && response !== '' && response !== null
  }).length
  return Math.round((answeredCount / intakeQuestions.length) * 100)
}
