export interface UserInterface {
  userID: string;
  firstName: string;
  lastName: string;
  password: string;
  country: string;
}

export interface FileInterface {
  fileID: string;
  userID: string;
  fileLink: string;
}

export interface AnalyzeInterface {
  fileID: string;
  wordLength: string;
  experience: string;
  education: string;
  achievements: string;
}
