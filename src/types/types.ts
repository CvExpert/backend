export interface User {
  userID: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface File {
  fileID: string;
  userID: string;
  fileLink: string;
}

export interface Analyze {
  fileID: string;
  wordLength: string;
  experience: string;
  education: string;
  achievements: string;
}
