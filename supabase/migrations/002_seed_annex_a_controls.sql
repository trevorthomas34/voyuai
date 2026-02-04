-- ISO 27001:2022 Annex A Controls Seed Data
-- 93 controls across 4 themes:
-- - Organizational (37 controls: A.5)
-- - People (8 controls: A.6)
-- - Physical (14 controls: A.7)
-- - Technological (34 controls: A.8)

INSERT INTO controls (control_id, name, intent, theme, guidance) VALUES

-- =============================================================================
-- A.5 ORGANIZATIONAL CONTROLS (37 controls)
-- =============================================================================

('A.5.1', 'Policies for information security',
 'To provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.',
 'organizational',
 'Define and approve an information security policy, communicate to all relevant parties, and review at planned intervals.'),

('A.5.2', 'Information security roles and responsibilities',
 'To establish a defined and approved structure for implementing, maintaining, and managing information security within the organization.',
 'organizational',
 'Define and allocate information security responsibilities. Document roles clearly.'),

('A.5.3', 'Segregation of duties',
 'To reduce the risk of fraud, error, and bypassing of information security controls.',
 'organizational',
 'Segregate conflicting duties and areas of responsibility. Implement compensating controls where segregation is not possible.'),

('A.5.4', 'Management responsibilities',
 'To ensure management actively supports information security within the organization.',
 'organizational',
 'Management shall require all employees and contractors to apply information security according to policies.'),

('A.5.5', 'Contact with authorities',
 'To maintain appropriate contacts with relevant authorities.',
 'organizational',
 'Maintain contacts with relevant authorities (law enforcement, regulatory bodies, etc.).'),

('A.5.6', 'Contact with special interest groups',
 'To maintain appropriate contacts with special interest groups or other specialist security forums.',
 'organizational',
 'Participate in professional associations, forums, and mailing lists related to information security.'),

('A.5.7', 'Threat intelligence',
 'To provide awareness of the organization''s threat environment so that appropriate mitigation actions can be taken.',
 'organizational',
 'Collect and analyze information relating to information security threats. Use threat intelligence feeds.'),

('A.5.8', 'Information security in project management',
 'To ensure information security is integrated into project management.',
 'organizational',
 'Include information security in all phases of project management regardless of project type.'),

('A.5.9', 'Inventory of information and other associated assets',
 'To identify the organization''s information and other associated assets, and define appropriate protection responsibilities.',
 'organizational',
 'Maintain an inventory of information and associated assets including owners.'),

('A.5.10', 'Acceptable use of information and other associated assets',
 'To ensure information and other associated assets are appropriately protected, used, and handled.',
 'organizational',
 'Define, document, and implement rules for acceptable use of information and assets.'),

('A.5.11', 'Return of assets',
 'To protect the organization''s assets as part of the process of changing or terminating employment.',
 'organizational',
 'Employees and contractors shall return all organizational assets upon termination.'),

('A.5.12', 'Classification of information',
 'To ensure information receives an appropriate level of protection in accordance with its importance.',
 'organizational',
 'Classify information according to legal requirements, value, criticality, and sensitivity.'),

('A.5.13', 'Labelling of information',
 'To facilitate the communication of classification of information and support automated processing.',
 'organizational',
 'Develop procedures for information labelling according to classification scheme.'),

('A.5.14', 'Information transfer',
 'To maintain the security of information transferred within and externally to the organization.',
 'organizational',
 'Establish rules, procedures, and agreements for all types of information transfer.'),

('A.5.15', 'Access control',
 'To ensure authorized access and prevent unauthorized access to information and other associated assets.',
 'organizational',
 'Establish and implement access control policy based on business and security requirements.'),

('A.5.16', 'Identity management',
 'To enable the correct identification of individuals and systems accessing the organization''s assets.',
 'organizational',
 'Manage full lifecycle of identities including provisioning, changes, and removal.'),

('A.5.17', 'Authentication information',
 'To ensure proper use of authentication information.',
 'organizational',
 'Control allocation and management of authentication information through formal process.'),

('A.5.18', 'Access rights',
 'To ensure authorized user access and prevent unauthorized access to systems and services.',
 'organizational',
 'Provision, review, and remove access rights according to policy.'),

('A.5.19', 'Information security in supplier relationships',
 'To maintain an agreed level of information security in supplier relationships.',
 'organizational',
 'Establish and agree security requirements with suppliers accessing organizational assets.'),

('A.5.20', 'Addressing information security within supplier agreements',
 'To maintain an agreed level of information security in supplier relationships.',
 'organizational',
 'Include relevant information security requirements in supplier agreements.'),

('A.5.21', 'Managing information security in the ICT supply chain',
 'To maintain an agreed level of information security for the ICT supply chain.',
 'organizational',
 'Define requirements for managing ICT supply chain security risks.'),

('A.5.22', 'Monitoring, review and change management of supplier services',
 'To maintain an agreed level of information security and service delivery in line with supplier agreements.',
 'organizational',
 'Regularly monitor, review, and audit supplier service delivery.'),

('A.5.23', 'Information security for use of cloud services',
 'To specify and manage information security for the use of cloud services.',
 'organizational',
 'Establish processes for acquisition, use, management, and exit from cloud services.'),

('A.5.24', 'Information security incident management planning and preparation',
 'To ensure a quick, effective, and orderly response to information security incidents.',
 'organizational',
 'Plan and prepare for managing information security incidents.'),

('A.5.25', 'Assessment and decision on information security events',
 'To ensure events are properly assessed and classified.',
 'organizational',
 'Assess information security events and decide if they should be classified as incidents.'),

('A.5.26', 'Response to information security incidents',
 'To ensure a consistent and effective approach to handling information security incidents.',
 'organizational',
 'Respond to information security incidents in accordance with documented procedures.'),

('A.5.27', 'Learning from information security incidents',
 'To reduce the likelihood or impact of future incidents.',
 'organizational',
 'Use knowledge gained from incidents to strengthen controls.'),

('A.5.28', 'Collection of evidence',
 'To support disciplinary and legal actions related to security incidents.',
 'organizational',
 'Define procedures for identification, collection, acquisition, and preservation of evidence.'),

('A.5.29', 'Information security during disruption',
 'To protect information during disruption.',
 'organizational',
 'Plan how to maintain information security during disruption.'),

('A.5.30', 'ICT readiness for business continuity',
 'To ensure availability of ICT during disruption.',
 'organizational',
 'Plan, implement, maintain, and test ICT readiness.'),

('A.5.31', 'Legal, statutory, regulatory and contractual requirements',
 'To avoid breaches of legal, statutory, regulatory, or contractual obligations.',
 'organizational',
 'Identify, document, and keep up to date all relevant legal requirements.'),

('A.5.32', 'Intellectual property rights',
 'To ensure compliance with legal, statutory, regulatory, and contractual requirements related to intellectual property rights.',
 'organizational',
 'Implement procedures to ensure compliance with intellectual property requirements.'),

('A.5.33', 'Protection of records',
 'To protect records from loss, destruction, falsification, and unauthorized access or release.',
 'organizational',
 'Protect records in accordance with legal, regulatory, and business requirements.'),

('A.5.34', 'Privacy and protection of PII',
 'To ensure compliance with legal, regulatory, and contractual requirements regarding privacy and protection of PII.',
 'organizational',
 'Identify and meet requirements for preserving privacy and protecting PII.'),

('A.5.35', 'Independent review of information security',
 'To ensure ongoing suitability, adequacy, and effectiveness of information security management.',
 'organizational',
 'Conduct independent reviews at planned intervals or when significant changes occur.'),

('A.5.36', 'Compliance with policies, rules and standards for information security',
 'To ensure information security is implemented and operated in accordance with policies.',
 'organizational',
 'Review compliance with information security policies and standards regularly.'),

('A.5.37', 'Documented operating procedures',
 'To ensure correct and secure operations of information processing facilities.',
 'organizational',
 'Document operating procedures and make them available to personnel who need them.'),

-- =============================================================================
-- A.6 PEOPLE CONTROLS (8 controls)
-- =============================================================================

('A.6.1', 'Screening',
 'To ensure all candidates are suitable and remain suitable for the roles they are employed in.',
 'people',
 'Conduct background verification checks on all candidates in accordance with relevant laws.'),

('A.6.2', 'Terms and conditions of employment',
 'To ensure employees and contractors understand their information security responsibilities.',
 'people',
 'Include information security responsibilities in employment contracts.'),

('A.6.3', 'Information security awareness, education and training',
 'To ensure personnel are aware of and can fulfil their information security responsibilities.',
 'people',
 'Provide appropriate awareness, education, and training programs.'),

('A.6.4', 'Disciplinary process',
 'To ensure personnel and other relevant parties understand consequences of security policy breaches.',
 'people',
 'Establish a formal disciplinary process for personnel who commit security breaches.'),

('A.6.5', 'Responsibilities after termination or change of employment',
 'To protect the organization''s interests as part of the process of changing or terminating employment.',
 'people',
 'Define responsibilities that remain valid after termination and enforce them.'),

('A.6.6', 'Confidentiality or non-disclosure agreements',
 'To maintain confidentiality of information accessible by personnel or external parties.',
 'people',
 'Identify and regularly review confidentiality requirements in agreements.'),

('A.6.7', 'Remote working',
 'To protect information when personnel work remotely.',
 'people',
 'Implement security measures when personnel work outside organizational premises.'),

('A.6.8', 'Information security event reporting',
 'To support timely, consistent, and effective reporting of information security events.',
 'people',
 'Provide a mechanism for personnel to report observed security events.'),

-- =============================================================================
-- A.7 PHYSICAL CONTROLS (14 controls)
-- =============================================================================

('A.7.1', 'Physical security perimeters',
 'To prevent unauthorized physical access, damage, and interference to information and information processing facilities.',
 'physical',
 'Define security perimeters to protect areas containing sensitive information.'),

('A.7.2', 'Physical entry',
 'To ensure only authorized access occurs and to protect against unauthorized entry.',
 'physical',
 'Protect secure areas by appropriate entry controls.'),

('A.7.3', 'Securing offices, rooms and facilities',
 'To prevent unauthorized access, damage, and interference to information.',
 'physical',
 'Design and apply physical security for offices, rooms, and facilities.'),

('A.7.4', 'Physical security monitoring',
 'To detect and deter unauthorized physical access.',
 'physical',
 'Monitor premises continuously for unauthorized physical access.'),

('A.7.5', 'Protecting against physical and environmental threats',
 'To prevent or reduce impact of physical and environmental threats.',
 'physical',
 'Design and implement protection against physical and environmental threats.'),

('A.7.6', 'Working in secure areas',
 'To protect information and assets in secure areas.',
 'physical',
 'Design and implement procedures for working in secure areas.'),

('A.7.7', 'Clear desk and clear screen',
 'To reduce risk of unauthorized access to and loss or damage of information.',
 'physical',
 'Implement clear desk policy for papers and clear screen policy for systems.'),

('A.7.8', 'Equipment siting and protection',
 'To reduce risk from environmental threats and unauthorized access opportunities.',
 'physical',
 'Site and protect equipment to reduce environmental risks.'),

('A.7.9', 'Security of assets off-premises',
 'To protect off-premises assets.',
 'physical',
 'Apply security to off-site assets considering different risks.'),

('A.7.10', 'Storage media',
 'To prevent unauthorized disclosure, modification, removal, or destruction of information on storage media.',
 'physical',
 'Manage storage media through its lifecycle including disposal.'),

('A.7.11', 'Supporting utilities',
 'To prevent loss, damage, or compromise of information due to supporting utility failures.',
 'physical',
 'Protect equipment from power failures and other utility disruptions.'),

('A.7.12', 'Cabling security',
 'To prevent interception, interference, or damage to cabling carrying information.',
 'physical',
 'Protect power and telecommunications cabling from interception or damage.'),

('A.7.13', 'Equipment maintenance',
 'To prevent loss, damage, theft, or compromise of equipment and interruption to operations.',
 'physical',
 'Maintain equipment correctly to ensure continued availability and integrity.'),

('A.7.14', 'Secure disposal or re-use of equipment',
 'To prevent information leakage from disposed or re-used equipment.',
 'physical',
 'Securely dispose of or re-use equipment containing storage media.'),

-- =============================================================================
-- A.8 TECHNOLOGICAL CONTROLS (34 controls)
-- =============================================================================

('A.8.1', 'User endpoint devices',
 'To protect information stored on, processed by, or accessible via user endpoint devices.',
 'technological',
 'Protect information on user endpoint devices with appropriate security measures.'),

('A.8.2', 'Privileged access rights',
 'To ensure that privileged access is authorized, managed, and controlled.',
 'technological',
 'Restrict and manage allocation and use of privileged access rights.'),

('A.8.3', 'Information access restriction',
 'To ensure authorized access and prevent unauthorized access to information.',
 'technological',
 'Restrict access to information and application system functions based on access control policy.'),

('A.8.4', 'Access to source code',
 'To prevent unauthorized access to, modification of, or destruction of source code.',
 'technological',
 'Restrict access to source code, development tools, and software libraries.'),

('A.8.5', 'Secure authentication',
 'To ensure users and systems are securely authenticated.',
 'technological',
 'Implement secure authentication technologies and procedures.'),

('A.8.6', 'Capacity management',
 'To ensure required capacity for information processing facilities, human resources, and other resources.',
 'technological',
 'Monitor and adjust resource use and project future capacity requirements.'),

('A.8.7', 'Protection against malware',
 'To ensure that information and other associated assets are protected against malware.',
 'technological',
 'Implement detection, prevention, and recovery controls against malware.'),

('A.8.8', 'Management of technical vulnerabilities',
 'To prevent exploitation of technical vulnerabilities.',
 'technological',
 'Obtain timely information about vulnerabilities, assess exposure, and take appropriate measures.'),

('A.8.9', 'Configuration management',
 'To ensure that security configurations are established and maintained.',
 'technological',
 'Define, implement, monitor, and review hardware, software, and network configurations.'),

('A.8.10', 'Information deletion',
 'To prevent unnecessary exposure of sensitive information and to comply with legal requirements.',
 'technological',
 'Delete information when no longer required in accordance with policy.'),

('A.8.11', 'Data masking',
 'To limit exposure of sensitive data including PII, and to comply with legal requirements.',
 'technological',
 'Use data masking techniques in accordance with access control and business requirements.'),

('A.8.12', 'Data leakage prevention',
 'To detect and prevent unauthorized disclosure of sensitive information.',
 'technological',
 'Apply data leakage prevention measures to systems, networks, and other devices.'),

('A.8.13', 'Information backup',
 'To enable recovery of information and systems in the event of data loss.',
 'technological',
 'Maintain and regularly test backup copies of information, software, and systems.'),

('A.8.14', 'Redundancy of information processing facilities',
 'To ensure availability of information processing facilities.',
 'technological',
 'Implement information processing facilities with sufficient redundancy.'),

('A.8.15', 'Logging',
 'To record events, generate evidence, and support security investigations.',
 'technological',
 'Log user activities, exceptions, faults, and information security events.'),

('A.8.16', 'Monitoring activities',
 'To detect anomalous behaviour and potential security incidents.',
 'technological',
 'Monitor networks, systems, and applications for anomalous behaviour.'),

('A.8.17', 'Clock synchronization',
 'To enable correlation of events and support forensic investigations.',
 'technological',
 'Synchronize clocks of all information processing systems to approved time sources.'),

('A.8.18', 'Use of privileged utility programs',
 'To prevent unauthorized use of utility programs that could override system and application controls.',
 'technological',
 'Restrict and tightly control the use of utility programs.'),

('A.8.19', 'Installation of software on operational systems',
 'To ensure the integrity of operational systems and prevent exploitation of technical vulnerabilities.',
 'technological',
 'Implement procedures to control installation of software on operational systems.'),

('A.8.20', 'Networks security',
 'To protect information in networks and supporting information processing facilities.',
 'technological',
 'Manage and control networks to protect information in systems and applications.'),

('A.8.21', 'Security of network services',
 'To ensure security of network services.',
 'technological',
 'Identify, implement, and monitor security mechanisms and service levels for network services.'),

('A.8.22', 'Segregation of networks',
 'To segregate networks to limit scope of security incidents.',
 'technological',
 'Segregate groups of information services, users, and systems.'),

('A.8.23', 'Web filtering',
 'To protect systems from malware and prevent access to unauthorized web resources.',
 'technological',
 'Manage access to external websites to reduce exposure to malicious content.'),

('A.8.24', 'Use of cryptography',
 'To ensure proper and effective use of cryptography to protect information.',
 'technological',
 'Define rules for effective use of cryptography including key management.'),

('A.8.25', 'Secure development life cycle',
 'To ensure information security is designed and implemented within the development life cycle.',
 'technological',
 'Establish and apply rules for secure development of software and systems.'),

('A.8.26', 'Application security requirements',
 'To ensure information security requirements are identified and addressed in development.',
 'technological',
 'Identify, specify, and approve information security requirements in application development.'),

('A.8.27', 'Secure system architecture and engineering principles',
 'To ensure that secure systems are designed, implemented, and maintained.',
 'technological',
 'Establish, document, maintain, and apply secure system engineering principles.'),

('A.8.28', 'Secure coding',
 'To ensure that software is developed securely.',
 'technological',
 'Apply secure coding principles to software development.'),

('A.8.29', 'Security testing in development and acceptance',
 'To validate security requirements are met.',
 'technological',
 'Define and implement security testing processes in the development life cycle.'),

('A.8.30', 'Outsourced development',
 'To ensure outsourced system development meets security requirements.',
 'technological',
 'Direct, monitor, and review outsourced system development activities.'),

('A.8.31', 'Separation of development, test and production environments',
 'To reduce risks from unauthorized access or changes to production.',
 'technological',
 'Separate development, testing, and production environments.'),

('A.8.32', 'Change management',
 'To ensure that changes to information processing facilities and systems do not adversely impact security.',
 'technological',
 'Control changes to information processing facilities and systems.'),

('A.8.33', 'Test information',
 'To ensure relevance and protection of information used for testing.',
 'technological',
 'Select, protect, and manage test information appropriately.'),

('A.8.34', 'Protection of information systems during audit testing',
 'To minimize the impact of audit activities on operational systems.',
 'technological',
 'Plan and agree audit tests and activities involving evaluation of operational systems.');

-- Verification query (commented out - run manually to verify)
-- SELECT theme, COUNT(*) as control_count FROM controls GROUP BY theme ORDER BY theme;
-- Expected: organizational=37, people=8, physical=14, technological=34, total=93
