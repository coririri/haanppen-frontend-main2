export interface TestPaperType {
  testPaperId: number;
  testPaperName: string;
  teacherName: string;
  teacherId: number;
  studentCount: number;
}

export interface TestPaperStudentType {
  studentId: number;
  studentName: string;
  grade: number;
}

export interface TestPaperDetailType extends Omit<TestPaperType, 'studentCount'> {
  students: TestPaperStudentType[];
}
