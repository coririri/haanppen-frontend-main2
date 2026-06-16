import instance from './instance';

export const getTestPapers = () => instance.get('/api/test-papers');

export const getTestPaperById = (id: number) =>
  instance.get(`/api/test-papers/${id}`);

export const getTestPapersByTeacher = (teacherId: number) =>
  instance.get(`/api/test-papers/teacher/${teacherId}`);

export const enrollTestPaper = (
  testPaperName: string,
  teacherId: number,
  students: number[],
) =>
  instance.post('/api/manage/test-papers', {
    testPaperName,
    teacherId,
    students,
  });

export const putTestPaper = (
  id: number,
  testPaperName: string,
  teacherId: number,
) =>
  instance.put(`/api/manage/test-papers/${id}`, {
    testPaperName,
    teacherId,
  });

export const putTestPaperStudents = (id: number, students: number[]) =>
  instance.put(`/api/manage/test-papers/${id}/students`, {
    students,
  });

export const deleteTestPaper = (id: number) =>
  instance.delete(`/api/manage/test-papers/${id}`);
