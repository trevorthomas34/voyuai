// ISO 27001:2022 Annex A Controls data
// Structured for UI display with organization-specific applicability

import type { ControlTheme, ImplementationStatus } from '@/types/database'

export interface ControlData {
  id: string
  control_id: string
  name: string
  intent: string
  theme: ControlTheme
  // Organization-specific
  applicable: boolean
  justification: string | null
  implementation_status: ImplementationStatus
}

export const controlThemeLabels: Record<ControlTheme, string> = {
  organizational: 'Organizational Controls',
  people: 'People Controls',
  physical: 'Physical Controls',
  technological: 'Technological Controls'
}

export const controlThemeDescriptions: Record<ControlTheme, string> = {
  organizational: '37 controls covering policies, roles, supplier relationships, and incident management',
  people: '8 controls covering screening, awareness, and responsibilities',
  physical: '14 controls covering physical security and equipment',
  technological: '34 controls covering access, development, and technical security'
}

export const implementationStatusConfig: Record<ImplementationStatus, { label: string; color: string }> = {
  implemented: { label: 'Implemented', color: 'bg-green-100 text-green-800' },
  partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
  gap: { label: 'Gap', color: 'bg-red-100 text-red-800' },
  not_applicable: { label: 'N/A', color: 'bg-gray-100 text-gray-800' }
}

// All 93 Annex A controls with mock applicability data
export const annexAControls: ControlData[] = [
  // A.5 ORGANIZATIONAL CONTROLS (37)
  { id: '1', control_id: 'A.5.1', name: 'Policies for information security', intent: 'Provide management direction and support for information security', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '2', control_id: 'A.5.2', name: 'Information security roles and responsibilities', intent: 'Establish a defined structure for implementing and managing information security', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '3', control_id: 'A.5.3', name: 'Segregation of duties', intent: 'Reduce risk of fraud, error, and bypassing of controls', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '4', control_id: 'A.5.4', name: 'Management responsibilities', intent: 'Ensure management supports information security', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '5', control_id: 'A.5.5', name: 'Contact with authorities', intent: 'Maintain contacts with relevant authorities', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '6', control_id: 'A.5.6', name: 'Contact with special interest groups', intent: 'Maintain contacts with security forums and groups', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '7', control_id: 'A.5.7', name: 'Threat intelligence', intent: 'Provide awareness of the threat environment', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '8', control_id: 'A.5.8', name: 'Information security in project management', intent: 'Integrate information security into projects', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '9', control_id: 'A.5.9', name: 'Inventory of information and other associated assets', intent: 'Identify assets and define protection responsibilities', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '10', control_id: 'A.5.10', name: 'Acceptable use of information and other associated assets', intent: 'Ensure assets are appropriately used', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '11', control_id: 'A.5.11', name: 'Return of assets', intent: 'Protect assets when employment changes', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '12', control_id: 'A.5.12', name: 'Classification of information', intent: 'Ensure information receives appropriate protection', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '13', control_id: 'A.5.13', name: 'Labelling of information', intent: 'Facilitate communication of classification', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '14', control_id: 'A.5.14', name: 'Information transfer', intent: 'Maintain security of transferred information', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '15', control_id: 'A.5.15', name: 'Access control', intent: 'Ensure authorized access and prevent unauthorized access', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '16', control_id: 'A.5.16', name: 'Identity management', intent: 'Enable correct identification of users and systems', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '17', control_id: 'A.5.17', name: 'Authentication information', intent: 'Ensure proper use of authentication information', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '18', control_id: 'A.5.18', name: 'Access rights', intent: 'Ensure authorized user access to systems', theme: 'organizational', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '19', control_id: 'A.5.19', name: 'Information security in supplier relationships', intent: 'Maintain security in supplier relationships', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '20', control_id: 'A.5.20', name: 'Addressing information security within supplier agreements', intent: 'Include security requirements in agreements', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '21', control_id: 'A.5.21', name: 'Managing information security in the ICT supply chain', intent: 'Manage ICT supply chain security risks', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '22', control_id: 'A.5.22', name: 'Monitoring, review and change management of supplier services', intent: 'Monitor supplier service delivery', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '23', control_id: 'A.5.23', name: 'Information security for use of cloud services', intent: 'Manage security for cloud services', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '24', control_id: 'A.5.24', name: 'Information security incident management planning and preparation', intent: 'Ensure orderly response to incidents', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '25', control_id: 'A.5.25', name: 'Assessment and decision on information security events', intent: 'Properly assess and classify events', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '26', control_id: 'A.5.26', name: 'Response to information security incidents', intent: 'Respond consistently to incidents', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '27', control_id: 'A.5.27', name: 'Learning from information security incidents', intent: 'Reduce likelihood of future incidents', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '28', control_id: 'A.5.28', name: 'Collection of evidence', intent: 'Support legal actions related to incidents', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '29', control_id: 'A.5.29', name: 'Information security during disruption', intent: 'Protect information during disruption', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '30', control_id: 'A.5.30', name: 'ICT readiness for business continuity', intent: 'Ensure ICT availability during disruption', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '31', control_id: 'A.5.31', name: 'Legal, statutory, regulatory and contractual requirements', intent: 'Avoid breaches of legal requirements', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '32', control_id: 'A.5.32', name: 'Intellectual property rights', intent: 'Ensure compliance with IP requirements', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '33', control_id: 'A.5.33', name: 'Protection of records', intent: 'Protect records from loss and unauthorized access', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '34', control_id: 'A.5.34', name: 'Privacy and protection of PII', intent: 'Ensure compliance with privacy requirements', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '35', control_id: 'A.5.35', name: 'Independent review of information security', intent: 'Ensure ongoing effectiveness of ISMS', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '36', control_id: 'A.5.36', name: 'Compliance with policies, rules and standards', intent: 'Ensure compliance with security policies', theme: 'organizational', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '37', control_id: 'A.5.37', name: 'Documented operating procedures', intent: 'Ensure correct and secure operations', theme: 'organizational', applicable: true, justification: null, implementation_status: 'partial' },

  // A.6 PEOPLE CONTROLS (8)
  { id: '38', control_id: 'A.6.1', name: 'Screening', intent: 'Ensure candidates are suitable for roles', theme: 'people', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '39', control_id: 'A.6.2', name: 'Terms and conditions of employment', intent: 'Ensure employees understand their responsibilities', theme: 'people', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '40', control_id: 'A.6.3', name: 'Information security awareness, education and training', intent: 'Ensure personnel can fulfil their responsibilities', theme: 'people', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '41', control_id: 'A.6.4', name: 'Disciplinary process', intent: 'Ensure consequences for policy breaches', theme: 'people', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '42', control_id: 'A.6.5', name: 'Responsibilities after termination or change of employment', intent: 'Protect organization after employment changes', theme: 'people', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '43', control_id: 'A.6.6', name: 'Confidentiality or non-disclosure agreements', intent: 'Maintain confidentiality of information', theme: 'people', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '44', control_id: 'A.6.7', name: 'Remote working', intent: 'Protect information when working remotely', theme: 'people', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '45', control_id: 'A.6.8', name: 'Information security event reporting', intent: 'Support timely reporting of security events', theme: 'people', applicable: true, justification: null, implementation_status: 'gap' },

  // A.7 PHYSICAL CONTROLS (14)
  { id: '46', control_id: 'A.7.1', name: 'Physical security perimeters', intent: 'Prevent unauthorized physical access', theme: 'physical', applicable: false, justification: 'Fully remote organization with no physical premises', implementation_status: 'not_applicable' },
  { id: '47', control_id: 'A.7.2', name: 'Physical entry', intent: 'Ensure only authorized physical access', theme: 'physical', applicable: false, justification: 'Fully remote organization with no physical premises', implementation_status: 'not_applicable' },
  { id: '48', control_id: 'A.7.3', name: 'Securing offices, rooms and facilities', intent: 'Prevent unauthorized access to facilities', theme: 'physical', applicable: false, justification: 'Fully remote organization with no physical premises', implementation_status: 'not_applicable' },
  { id: '49', control_id: 'A.7.4', name: 'Physical security monitoring', intent: 'Detect unauthorized physical access', theme: 'physical', applicable: false, justification: 'Fully remote organization with no physical premises', implementation_status: 'not_applicable' },
  { id: '50', control_id: 'A.7.5', name: 'Protecting against physical and environmental threats', intent: 'Prevent impact of physical threats', theme: 'physical', applicable: false, justification: 'Cloud-hosted infrastructure, no physical data centers', implementation_status: 'not_applicable' },
  { id: '51', control_id: 'A.7.6', name: 'Working in secure areas', intent: 'Protect information in secure areas', theme: 'physical', applicable: false, justification: 'Fully remote organization', implementation_status: 'not_applicable' },
  { id: '52', control_id: 'A.7.7', name: 'Clear desk and clear screen', intent: 'Reduce risk of unauthorized access', theme: 'physical', applicable: true, justification: 'Applicable to remote workers', implementation_status: 'partial' },
  { id: '53', control_id: 'A.7.8', name: 'Equipment siting and protection', intent: 'Reduce environmental risks', theme: 'physical', applicable: true, justification: 'Applicable to employee home offices', implementation_status: 'partial' },
  { id: '54', control_id: 'A.7.9', name: 'Security of assets off-premises', intent: 'Protect off-site assets', theme: 'physical', applicable: true, justification: 'All assets are off-premises (remote)', implementation_status: 'partial' },
  { id: '55', control_id: 'A.7.10', name: 'Storage media', intent: 'Prevent unauthorized disclosure from media', theme: 'physical', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '56', control_id: 'A.7.11', name: 'Supporting utilities', intent: 'Prevent loss from utility failures', theme: 'physical', applicable: false, justification: 'Cloud-hosted infrastructure', implementation_status: 'not_applicable' },
  { id: '57', control_id: 'A.7.12', name: 'Cabling security', intent: 'Prevent interception of cabling', theme: 'physical', applicable: false, justification: 'No organizational network cabling', implementation_status: 'not_applicable' },
  { id: '58', control_id: 'A.7.13', name: 'Equipment maintenance', intent: 'Prevent loss from equipment failure', theme: 'physical', applicable: true, justification: 'Applicable to employee laptops', implementation_status: 'partial' },
  { id: '59', control_id: 'A.7.14', name: 'Secure disposal or re-use of equipment', intent: 'Prevent information leakage from disposal', theme: 'physical', applicable: true, justification: null, implementation_status: 'gap' },

  // A.8 TECHNOLOGICAL CONTROLS (34)
  { id: '60', control_id: 'A.8.1', name: 'User endpoint devices', intent: 'Protect information on endpoint devices', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '61', control_id: 'A.8.2', name: 'Privileged access rights', intent: 'Control privileged access', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '62', control_id: 'A.8.3', name: 'Information access restriction', intent: 'Prevent unauthorized access to information', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '63', control_id: 'A.8.4', name: 'Access to source code', intent: 'Prevent unauthorized access to source code', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '64', control_id: 'A.8.5', name: 'Secure authentication', intent: 'Ensure secure authentication', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '65', control_id: 'A.8.6', name: 'Capacity management', intent: 'Ensure required capacity', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '66', control_id: 'A.8.7', name: 'Protection against malware', intent: 'Protect against malware', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '67', control_id: 'A.8.8', name: 'Management of technical vulnerabilities', intent: 'Prevent exploitation of vulnerabilities', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '68', control_id: 'A.8.9', name: 'Configuration management', intent: 'Maintain security configurations', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '69', control_id: 'A.8.10', name: 'Information deletion', intent: 'Prevent exposure of sensitive information', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '70', control_id: 'A.8.11', name: 'Data masking', intent: 'Limit exposure of sensitive data', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '71', control_id: 'A.8.12', name: 'Data leakage prevention', intent: 'Detect and prevent data disclosure', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '72', control_id: 'A.8.13', name: 'Information backup', intent: 'Enable recovery from data loss', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '73', control_id: 'A.8.14', name: 'Redundancy of information processing facilities', intent: 'Ensure availability', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '74', control_id: 'A.8.15', name: 'Logging', intent: 'Record events for investigations', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '75', control_id: 'A.8.16', name: 'Monitoring activities', intent: 'Detect anomalous behaviour', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '76', control_id: 'A.8.17', name: 'Clock synchronization', intent: 'Enable event correlation', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '77', control_id: 'A.8.18', name: 'Use of privileged utility programs', intent: 'Prevent unauthorized use of utilities', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '78', control_id: 'A.8.19', name: 'Installation of software on operational systems', intent: 'Ensure integrity of operational systems', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '79', control_id: 'A.8.20', name: 'Networks security', intent: 'Protect information in networks', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '80', control_id: 'A.8.21', name: 'Security of network services', intent: 'Ensure security of network services', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '81', control_id: 'A.8.22', name: 'Segregation of networks', intent: 'Limit scope of security incidents', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '82', control_id: 'A.8.23', name: 'Web filtering', intent: 'Protect systems from malicious content', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '83', control_id: 'A.8.24', name: 'Use of cryptography', intent: 'Ensure effective use of cryptography', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '84', control_id: 'A.8.25', name: 'Secure development life cycle', intent: 'Ensure security in development', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '85', control_id: 'A.8.26', name: 'Application security requirements', intent: 'Identify security requirements in development', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '86', control_id: 'A.8.27', name: 'Secure system architecture and engineering principles', intent: 'Ensure secure system design', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '87', control_id: 'A.8.28', name: 'Secure coding', intent: 'Ensure software is developed securely', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '88', control_id: 'A.8.29', name: 'Security testing in development and acceptance', intent: 'Validate security requirements', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' },
  { id: '89', control_id: 'A.8.30', name: 'Outsourced development', intent: 'Ensure outsourced development meets requirements', theme: 'technological', applicable: false, justification: 'No outsourced development', implementation_status: 'not_applicable' },
  { id: '90', control_id: 'A.8.31', name: 'Separation of development, test and production environments', intent: 'Reduce risks from unauthorized changes', theme: 'technological', applicable: true, justification: null, implementation_status: 'implemented' },
  { id: '91', control_id: 'A.8.32', name: 'Change management', intent: 'Ensure changes do not impact security', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '92', control_id: 'A.8.33', name: 'Test information', intent: 'Protect test information', theme: 'technological', applicable: true, justification: null, implementation_status: 'partial' },
  { id: '93', control_id: 'A.8.34', name: 'Protection of information systems during audit testing', intent: 'Minimize impact of audit activities', theme: 'technological', applicable: true, justification: null, implementation_status: 'gap' }
]

// Get controls grouped by theme
export function getControlsByTheme(): Record<ControlTheme, ControlData[]> {
  return {
    organizational: annexAControls.filter(c => c.theme === 'organizational'),
    people: annexAControls.filter(c => c.theme === 'people'),
    physical: annexAControls.filter(c => c.theme === 'physical'),
    technological: annexAControls.filter(c => c.theme === 'technological')
  }
}

// Get control stats
export function getControlStats(controls: ControlData[]) {
  const applicable = controls.filter(c => c.applicable)
  return {
    total: controls.length,
    applicable: applicable.length,
    notApplicable: controls.length - applicable.length,
    implemented: applicable.filter(c => c.implementation_status === 'implemented').length,
    partial: applicable.filter(c => c.implementation_status === 'partial').length,
    gap: applicable.filter(c => c.implementation_status === 'gap').length
  }
}
