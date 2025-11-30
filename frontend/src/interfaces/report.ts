export interface ReportData {
  submission_id: string;
  username: string;
  contact: string;
  pathways: Array<{
    pathname: string;
    tag: string;
    careerImage: string;
    title: string;
    subtitle: string;
    description: string;
    skills: string[];
    subjects: Array<{ name: string; image: string }>;
    careers: Array<{
      title: string;
      careers: string[];
    }>;
    tryThis: string;
  }>;
}
