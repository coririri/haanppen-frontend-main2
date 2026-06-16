export interface TestPaperLectureVideoType {
  fileName: string;
  isDir: boolean;
  path: string;
  createdTime: string;
  canViewByEveryone: boolean;
  canModifyByEveryone: boolean;
  runtimeDuration: number;
  fileSize: number;
}

export interface TestPaperLectureType {
  lectureId: number;
  testPaperId: number;
  testPaperName: string;
  lectureName: string;
  description: string | null;
  directoryPath: string | null;
  createdTime: string;
  videos: TestPaperLectureVideoType[];
}
