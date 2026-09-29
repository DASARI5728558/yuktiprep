export enum JobCategory {
  UPSC_SSC = 'UPSC & SSC',
  RAILWAY = 'Railways',
  BANKING = 'Banking & Finance',
  DEFENCE = 'Defence & Police',
  TECHNICAL = 'Engineering & PSU',
  STATE_PSC = 'State PSC',
  TEACHING = 'Teaching & Academic',
  MEDICAL = 'Medical & Healthcare',
  LOCAL_GOVT = 'Local & Municipal',
  ALL = 'All Categories'
}

export enum JobType {
  PERMANENT = 'Permanent',
  CONTRACT = 'Contractual',
  APPRENTICE = 'Apprenticeship',
  ALL = 'All Types'
}

export interface JobNotification {
  id: string;
  title: string;
  department: string;
  organization: string;
  location: string;
  state: string;
  category: string;
  postDate: string;
  lastDate: string;
  applyByDate: string;
  qualification: string[];
  totalPosts: string;
  salary: string;
  ageLimit: string;
  applicationFee: string;
  selectionProcess: string;
  officialPdfUrl: string;
  sourceUrl: string;
  status: string;
  publicationSource: string;
  employmentType: string;
  examProjectedDate: string;
  expectedResultsDate: string;
  uniqueCapabilities: string;
  description: string;
}

export interface SearchFilters {
  query?: string;
  state?: string;
  category?: string;
  qualification?: string;
  jobType?: string;
}

export interface OfficialPortal {
  name: string;
  domain: string;
  url: string;
  category: string;
  level: string;
  description: string;
  status: string;
}

