export interface Goal {
  id: number;
  title: string;
  description: string;
  icon: string;
  milestone: string;
  actionDetails: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: 'Job' | 'Internship' | 'Volunteer' | 'Workshop';
  location: string;
  deadline: string;
  description: string;
  requirements: string[];
}

export interface Webinar {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  registeredCount: number;
  description: string;
}

export interface Pledge {
  id: string;
  name: string;
  district: string;
  treesCount: number;
  action: string;
  timestamp: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}
