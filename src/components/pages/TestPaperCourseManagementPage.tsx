import { useState } from 'react';
import { AiOutlineSmile, AiFillEdit } from 'react-icons/ai';
import IconButton from '../atoms/IconButton';
import TestPaperCourseList from '../organisms/TestPaperCourseList';
import TestPaperCourseEnrollmentModal from '../modals/TestPaperCourseEnrollmentModal';
import TeacherDropdown from '../molecules/TeacherDropdown';
import DeleteCheckModal from '../modals/DeleteCheckModal';
import { TeacherType } from '../../types/teacherType';
import { CourseType } from '../../types/courseType';

const STATIC_TEACHERS: TeacherType[] = [
  { id: 1, name: '김선생', phoneNumber: '010-0000-0001', registeredDateTime: '2024-01-01T00:00:00' },
  { id: 2, name: '이선생', phoneNumber: '010-0000-0002', registeredDateTime: '2024-01-01T00:00:00' },
];

const STATIC_COURSES: CourseType[] = [
  {
    courseId: 1,
    courseName: '수학 문제집 반',
    studentSize: 10,
    teacherPreview: { teacherId: 1, teacherName: '김선생' },
  },
  {
    courseId: 2,
    courseName: '영어 문제집 반',
    studentSize: 8,
    teacherPreview: { teacherId: 2, teacherName: '이선생' },
  },
];

function TestPaperCourseManagementPage() {
  const [enrollmentModalOpen, setEnrollmentModalOpen] =
    useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [courseListData, setCourseListData] =
    useState<CourseType[]>(STATIC_COURSES);
  const [deletedCoursesIndex, setDeletedCoursesIndex] = useState<number[]>([]);
  const [deleteCheckModalOpen, setDeleteCheckModalOpen] =
    useState<boolean>(false);
  console.log(deletedCoursesIndex);
  return (
    <div className="w-full text-center">
      <TestPaperCourseEnrollmentModal
        enrollmentModalOpen={enrollmentModalOpen}
        setEnrollmentModalOpen={setEnrollmentModalOpen}
        setCourseListData={setCourseListData}
        teacherArr={STATIC_TEACHERS}
        selectedIndex={selectedIndex}
      />
      <DeleteCheckModal
        deleteCheckModalOpen={deleteCheckModalOpen}
        setDeleteCheckModalOpen={setDeleteCheckModalOpen}
        handleDelete={async () => {
          setCourseListData((prev) =>
            prev.filter((course) => deletedCoursesIndex.indexOf(course.courseId) === -1),
          );
          setDeleteCheckModalOpen(false);
          setDeletedCoursesIndex([]);
        }}
      />
      <hr className="h-[1px] border-0 bg-hpGray w-[700px] mx-auto mt-2" />
      <div className="flex items-center  w-[550px] mx-auto justify-between mt-4">
        <div className="flex items-center">
          <div className="mr-6">
            <IconButton
              bgColor="blue"
              icon={<AiOutlineSmile size="26px" color="white" />}
              text="반 등록"
              handleClick={() => {
                setEnrollmentModalOpen(true);
              }}
            />
          </div>
          <div>
            <IconButton
              bgColor="white"
              icon={<AiFillEdit size="26px" color="black" />}
              text="반 삭제"
              handleClick={() => {
                setDeleteCheckModalOpen(true);
              }}
            />
          </div>
        </div>
        <div>
          <div className="relative inline-block">
            <TeacherDropdown
              textArr={[
                '선택 없음',
                ...STATIC_TEACHERS.map((teacher) => teacher.name),
              ]}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <TestPaperCourseList
          courseListData={courseListData}
          setDeletedCoursesIndex={setDeletedCoursesIndex}
          setCourseListData={setCourseListData}
          teacherArr={STATIC_TEACHERS}
          selectedIndex={selectedIndex}
        />
      </div>
    </div>
  );
}

export default TestPaperCourseManagementPage;
