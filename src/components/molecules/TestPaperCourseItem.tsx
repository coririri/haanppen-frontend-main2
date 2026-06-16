import { useState } from 'react';
import TextButton from '../atoms/TextButton';
import TestPaperCourseModificationModal from '../modals/TestPaperCourseModificationModal';
import { TeacherType } from '../../types/teacherType';

interface TestPaperCourseItemType {
  testPaperName: string;
  studentCount: number;
  teacherName: string;
  testPaperId: number;
  onSuccess: () => Promise<void>;
  setDeletedCoursesIndex: React.Dispatch<React.SetStateAction<number[]>>;
  teacherArr: TeacherType[];
}

function TestPaperCourseItem({
  testPaperName,
  studentCount,
  teacherName,
  testPaperId,
  onSuccess,
  setDeletedCoursesIndex,
  teacherArr,
}: TestPaperCourseItemType) {
  const [isClick, setIsClick] = useState(false);
  return (
    <div>
      <TestPaperCourseModificationModal
        enrollmentModalOpen={isClick}
        setEnrollmentModalOpen={setIsClick}
        onSuccess={onSuccess}
        courseId={testPaperId}
        initialCourseName={testPaperName}
        initialTeacherName={teacherName}
        teacherArr={teacherArr}
      />
      <div className="flex items-center justify-between my-2">
        <input
          type="checkbox"
          className="w-[16px] h-[16px]"
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.checked) {
              setDeletedCoursesIndex((prev) => [...prev, testPaperId]);
            } else {
              setDeletedCoursesIndex((prev) =>
                prev.filter((item) => item !== testPaperId),
              );
            }
          }}
        />
        <span className="text-lg font-bold text-black w-[140px] text-center">
          {testPaperName}
        </span>
        <span className="text-lg font-bold text-black w-[90px] text-center">
          {studentCount}
        </span>
        <span className="text-lg font-bold text-black w-[140px]">
          {teacherName}
        </span>
        <div className="w-[100px]">
          <TextButton
            color="gray"
            moreStyle="w-[65px]"
            isClick={isClick}
            handleClick={() => {
              setIsClick((prev) => !prev);
            }}
          >
            상세
          </TextButton>
        </div>
      </div>
      <hr className="h-[0.5px] border-0 bg-hpGray w-[800px] mx-auto mt-2" />
    </div>
  );
}

export default TestPaperCourseItem;
