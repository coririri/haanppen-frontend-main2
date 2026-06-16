import instance from './instance';

export const createTestPaperLecture = (
  testPaperId: number,
  lectureName: string,
  description: string,
  directoryPath: string,
) =>
  instance.post(`/api/test-papers/${testPaperId}/lecture`, {
    lectureName,
    description,
    directoryPath,
  });

export const getTestPaperLectureByLectureId = (lectureId: number) =>
  instance.get(`/api/test-papers/lectures/${lectureId}`);

export const getTestPaperLectureByTestPaperId = (testPaperId: number) =>
  instance.get(`/api/test-papers/${testPaperId}/lecture`);

export const updateTestPaperLecture = (
  lectureId: number,
  lectureName?: string,
  description?: string,
  directoryPath?: string,
) =>
  instance.put(`/api/test-papers/lectures/${lectureId}`, {
    lectureName,
    description,
    directoryPath,
  });

export const deleteTestPaperLecture = (lectureId: number) =>
  instance.delete(`/api/test-papers/lectures/${lectureId}`);
