import { JobCategory } from './mockJobsData.js';

export const VERIFIED_OFFICIAL_PORTALS = [
  // Central & Civil Services
  {
    name: 'Union Public Service Commission (UPSC)',
    domain: 'upsc.gov.in',
    url: 'https://upsc.gov.in',
    category: JobCategory.UPSC_SSC,
    level: 'Central',
    description: 'Civil Services (IAS, IPS, IFS), CDS, NDA, CAPF, Engineering Services & Medical Services examinations.',
    status: 'Operational'
  },
  {
    name: 'Staff Selection Commission (SSC)',
    domain: 'ssc.gov.in',
    url: 'https://ssc.gov.in',
    category: JobCategory.UPSC_SSC,
    level: 'Central',
    description: 'Combined Graduate Level (CGL), CHSL, GD Constable, Multi Tasking Staff (MTS), CPO & Junior Engineer recruitments.',
    status: 'Operational'
  },
  // Railways
  {
    name: 'Railway Recruitment Boards (RRB)',
    domain: 'rrbcdg.gov.in',
    url: 'https://www.rrbcdg.gov.in',
    category: JobCategory.RAILWAY,
    level: 'Central',
    description: 'RRB NTPC, Assistant Loco Pilot (ALP), Technician, Group D / Level 1 & Junior Engineer across 21 regional boards.',
    status: 'Operational'
  },
  {
    name: 'Railway Recruitment Cells (RRC)',
    domain: 'indianrailways.gov.in',
    url: 'https://indianrailways.gov.in',
    category: JobCategory.RAILWAY,
    level: 'Central',
    description: 'Apprentice and departmental track maintainer, helper, and Level-1 direct recruitment.',
    status: 'Operational'
  },
  // Banking & Financial
  {
    name: 'Institute of Banking Personnel Selection (IBPS)',
    domain: 'ibps.in',
    url: 'https://www.ibps.in',
    category: JobCategory.BANKING,
    level: 'Central',
    description: 'Common Recruitment Process for PO/MT, Clerk, Specialist Officer, and Regional Rural Banks (RRB Officers & Assistants).',
    status: 'Operational'
  },
  {
    name: 'State Bank of India Careers (SBI)',
    domain: 'sbi.co.in/careers',
    url: 'https://sbi.co.in/web/careers',
    category: JobCategory.BANKING,
    level: 'Central',
    description: 'SBI Probationary Officers (PO), Junior Associates (Clerk), and Specialist Cadre Officers (SCO).',
    status: 'Operational'
  },
  {
    name: 'Reserve Bank of India (RBI)',
    domain: 'opportunities.rbi.org.in',
    url: 'https://opportunities.rbi.org.in',
    category: JobCategory.BANKING,
    level: 'Central',
    description: 'RBI Grade B Officers (General, DEPR, DSIM) and Assistant recruitments.',
    status: 'Operational'
  },
  {
    name: 'NABARD',
    domain: 'nabard.org',
    url: 'https://www.nabard.org/careers-notices.aspx',
    category: JobCategory.BANKING,
    level: 'Central',
    description: 'Assistant Manager in Grade ‘A’ (Rural Development Banking Service).',
    status: 'Operational'
  },
  // Defence & Police
  {
    name: 'Join Indian Army',
    domain: 'joinindianarmy.nic.in',
    url: 'https://joinindianarmy.nic.in',
    category: JobCategory.DEFENCE,
    level: 'Central',
    description: 'Indian Army Officer Entries (TGC, SSC Tech, NCC) and Agniveer General Duty / Technical rallies.',
    status: 'Operational'
  },
  {
    name: 'Indian Air Force (IAF Airman & AFCAT)',
    domain: 'afcat.cdac.in',
    url: 'https://afcat.cdac.in',
    category: JobCategory.DEFENCE,
    level: 'Central',
    description: 'Air Force Common Admission Test (AFCAT), Meteorology Branch, and Agniveervayu entries.',
    status: 'Operational'
  },
  {
    name: 'Join Indian Navy',
    domain: 'joinindiannavy.gov.in',
    url: 'https://www.joinindiannavy.gov.in',
    category: JobCategory.DEFENCE,
    level: 'Central',
    description: 'Indian Navy Short Service Commission (SSC Officers), Sailor & Agniveer (SSR / MR) recruitments.',
    status: 'Operational'
  },
  {
    name: 'Indian Coast Guard',
    domain: 'joinindiancoastguard.cdac.in',
    url: 'https://joinindiancoastguard.cdac.in',
    category: JobCategory.DEFENCE,
    level: 'Central',
    description: 'Assistant Commandant, Navik (General Duty / Domestic Branch), and Yantrik vacancies.',
    status: 'Operational'
  },
  // PSUs & Engineering / Science
  {
    name: 'Indian Space Research Organisation (ISRO)',
    domain: 'isro.gov.in',
    url: 'https://www.isro.gov.in/Careers.html',
    category: JobCategory.TECHNICAL,
    level: 'Central',
    description: 'ISRO Centralised Recruitment Board (ICRB) Scientist / Engineer \'SC\', Technical Assistant & Technician posts.',
    status: 'Operational'
  },
  {
    name: 'Defence Research and Development Organisation (DRDO)',
    domain: 'drdo.gov.in',
    url: 'https://www.drdo.gov.in/careers',
    category: JobCategory.TECHNICAL,
    level: 'Central',
    description: 'RAC Scientist \'B\', CEPTAM Senior Technical Assistant (STA-B), and Technician \'A\'.',
    status: 'Operational'
  },
  {
    name: 'Oil and Natural Gas Corporation (ONGC)',
    domain: 'ongcindia.com',
    url: 'https://www.ongcindia.com/wps/wcm/connect/en/career/recruitment-notices/',
    category: JobCategory.TECHNICAL,
    level: 'PSU',
    description: 'Graduate Trainees in Engineering and Geo-sciences disciplines at E1 level through GATE.',
    status: 'Operational'
  },
  {
    name: 'NTPC Limited',
    domain: 'careers.ntpc.co.in',
    url: 'https://careers.ntpc.co.in',
    category: JobCategory.TECHNICAL,
    level: 'PSU',
    description: 'Executive Trainee (Engineering/Finance/HR) and Assistant Executive recruitment.',
    status: 'Operational'
  },
  {
    name: 'Bhabha Atomic Research Centre (BARC)',
    domain: 'barc.gov.in',
    url: 'https://www.barc.gov.in/careers/',
    category: JobCategory.TECHNICAL,
    level: 'Central',
    description: 'Scientific Officers through OCES/DGFS and Stipendiary Trainee Category-I & II.',
    status: 'Operational'
  },
  // State Public Service Commissions
  {
    name: 'Maharashtra Public Service Commission (MPSC)',
    domain: 'mpsc.gov.in',
    url: 'https://mpsc.gov.in',
    category: JobCategory.STATE_PSC,
    level: 'State',
    description: 'Maharashtra Civil Services (Rajyaseva), Subordinate Services (PSI, STI, ASO) & Forest Services.',
    status: 'Operational'
  },
  {
    name: 'Uttar Pradesh Public Service Commission (UPPSC)',
    domain: 'uppsc.up.nic.in',
    url: 'https://uppsc.up.nic.in',
    category: JobCategory.STATE_PSC,
    level: 'State',
    description: 'UP Combined State / Upper Subordinate Exam (PCS), RO/ARO, and Staff Nurse recruitments.',
    status: 'Operational'
  },
  {
    name: 'Bihar Public Service Commission (BPSC)',
    domain: 'bpsc.bih.nic.in',
    url: 'https://bpsc.bih.nic.in',
    category: JobCategory.STATE_PSC,
    level: 'State',
    description: 'BPSC Integrated Combined Competitive Examination (CCE) and Teacher Recruitment Examination (TRE).',
    status: 'Operational'
  },
  {
    name: 'Rajasthan Public Service Commission (RPSC)',
    domain: 'rpsc.rajasthan.gov.in',
    url: 'https://rpsc.rajasthan.gov.in',
    category: JobCategory.STATE_PSC,
    level: 'State',
    description: 'Rajasthan Administrative Service (RAS/RTS), School Lecturer, and Sub-Inspector recruitments.',
    status: 'Operational'
  },
  {
    name: 'Tamil Nadu Public Service Commission (TNPSC)',
    domain: 'tnpsc.gov.in',
    url: 'https://www.tnpsc.gov.in',
    category: JobCategory.STATE_PSC,
    level: 'State',
    description: 'Combined Civil Services Examination Group 1, Group 2/2A, and Group 4 services in Tamil Nadu.',
    status: 'Operational'
  },
  {
    name: 'Karnataka Public Service Commission (KPSC)',
    domain: 'kpsc.kar.nic.in',
    url: 'https://kpsc.kar.nic.in',
    category: JobCategory.STATE_PSC,
    level: 'State',
    description: 'Gazetted Probationers (KAS), Group C Non-Technical, and Village Administrative Officer posts.',
    status: 'Operational'
  },
  {
    name: 'Delhi Subordinate Services Selection Board (DSSSB)',
    domain: 'dsssb.delhi.gov.in',
    url: 'https://dsssb.delhi.gov.in',
    category: JobCategory.STATE_PSC,
    level: 'State',
    description: 'Recruitment for NCT Delhi Government schools (TGT/PGT/PRT), Municipal Corporations, and Welfare Boards.',
    status: 'Operational'
  },
  // Teaching & Academic
  {
    name: 'Kendriya Vidyalaya Sangathan (KVS)',
    domain: 'kvsangathan.nic.in',
    url: 'https://kvsangathan.nic.in',
    category: JobCategory.TEACHING,
    level: 'Central',
    description: 'Direct recruitment for Post Graduate Teachers (PGT), Trained Graduate Teachers (TGT), and PRT across India.',
    status: 'Operational'
  },
  {
    name: 'Navodaya Vidyalaya Samiti (NVS)',
    domain: 'navodaya.gov.in',
    url: 'https://navodaya.gov.in',
    category: JobCategory.TEACHING,
    level: 'Central',
    description: 'Recruitment drive for Principal, PGT, TGT and Miscellaneous teachers in Jawahar Navodaya Vidyalayas.',
    status: 'Operational'
  },
  {
    name: 'National Testing Agency (NTA UGC-NET)',
    domain: 'ugcnet.nta.ac.in',
    url: 'https://ugcnet.nta.ac.in',
    category: JobCategory.TEACHING,
    level: 'Central',
    description: 'Eligibility for Assistant Professor, Junior Research Fellowship (JRF), and PhD admission across 83 subjects.',
    status: 'Operational'
  },
  // Medical & Healthcare
  {
    name: 'All India Institute of Medical Sciences (AIIMS Exam)',
    domain: 'aiimsexams.ac.in',
    url: 'https://www.aiimsexams.ac.in',
    category: JobCategory.MEDICAL,
    level: 'Central',
    description: 'Nursing Officer Recruitment Common Eligibility Test (NORCET) and Senior Resident recruitments for all AIIMS.',
    status: 'Operational'
  },
  {
    name: 'Employees\' State Insurance Corporation (ESIC)',
    domain: 'esic.gov.in',
    url: 'https://www.esic.gov.in/recruitments',
    category: JobCategory.MEDICAL,
    level: 'Central',
    description: 'Specialist Grade II, Senior Residents, IMO Grade-II, and Paramedical Staff recruitments.',
    status: 'Operational'
  },
  // Local & Municipal
  {
    name: 'Brihanmumbai Municipal Corporation (BMC)',
    domain: 'portal.mcgm.gov.in',
    url: 'https://portal.mcgm.gov.in',
    category: JobCategory.LOCAL_GOVT,
    level: 'State',
    description: 'Junior Engineer (Civil, Mechanical, Electrical), Executive Health Officers, and Administrative Assistants.',
    status: 'Operational'
  },
  {
    name: 'Municipal Corporation of Delhi (MCD)',
    domain: 'mcdonline.nic.in',
    url: 'https://mcdonline.nic.in',
    category: JobCategory.LOCAL_GOVT,
    level: 'State',
    description: 'Municipal Health Inspectors, Primary Teachers, and Field Assistants recruitment.',
    status: 'Operational'
  }
];

