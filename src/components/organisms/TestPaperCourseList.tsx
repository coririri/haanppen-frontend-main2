import { TestPaperType } from '../../types/testPaperType';
import { TeacherType } from '../../types/teacherType';
import TestPaperCourseItem from '../molecules/TestPaperCourseItem';

interface TestPaperCourseListType {
  testPaperList: TestPaperType[];
  setDeletedCoursesIndex: React.Dispatch<React.SetStateAction<number[]>>;
  onSuccess: () => Promise<void>;
  teacherArr: TeacherType[];
}

function TestPaperCourseList({
  testPaperList,
  setDeletedCoursesIndex,
  onSuccess,
  teacherArr,
}: TestPaperCourseListType) {
  return (
    <div className="w-full">
      <div className="w-[800px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="w-[16px] h-[16px]" />
          <span className="text-lg font-bold text-hpGray w-[140px] text-center">
            반 이름
          </span>
          <span className="text-lg font-bold text-hpGray w-[90px]">
            반 학생
          </span>
          <span className="text-lg font-bold text-hpGray w-[140px]">
            담당 선생님
          </span>
          <span className="text-lg font-bold text-hpGray w-[100px]">상세</span>
        </div>
      </div>
      <hr className="h-[0.5px] border-0 bg-black w-[900px] mx-auto mt-2" />
      <div className="w-[800px] mx-auto mt-4">
        {testPaperList?.map((tp) => (
          <TestPaperCourseItem
            key={tp.testPaperId}
            testPaperId={tp.testPaperId}
            testPaperName={tp.testPaperName}
            studentCount={tp.studentCount}
            teacherName={tp.teacherName}
            setDeletedCoursesIndex={setDeletedCoursesIndex}
            onSuccess={onSuccess}
            teacherArr={teacherArr}
          />
        ))}
      </div>
      <hr className="h-[0.5px] border-0 bg-black w-[900px] mx-auto mt-2" />
    </div>
  );
}

export default TestPaperCourseList;
