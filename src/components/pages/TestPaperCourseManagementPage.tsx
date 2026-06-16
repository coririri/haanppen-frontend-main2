import { useEffect, useState } from 'react';
import { AiOutlineSmile, AiFillEdit } from 'react-icons/ai';
import IconButton from '../atoms/IconButton';
import TestPaperCourseList from '../organisms/TestPaperCourseList';
import TestPaperCourseEnrollmentModal from '../modals/TestPaperCourseEnrollmentModal';
import TeacherDropdown from '../molecules/TeacherDropdown';
import DeleteCheckModal from '../modals/DeleteCheckModal';
import { TeacherType } from '../../types/teacherType';
import { TestPaperType } from '../../types/testPaperType';
import getAllTeachers from '../../apis/teacher';
import { getTestPapers, deleteTestPaper } from '../../apis/testPaper';
import { getAllStudents } from '../../apis/student';
import { useCourseStudentStore } from '../../store/courseStudentsStore';

function TestPaperCourseManagementPage() {
  const [enrollmentModalOpen, setEnrollmentModalOpen] =
    useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [courseListData, setCourseListData] = useState<TestPaperType[]>([]);
  const [teacherArr, setTeacherArr] = useState<TeacherType[]>([]);
  const [deletedCoursesIndex, setDeletedCoursesIndex] = useState<number[]>([]);
  const [deleteCheckModalOpen, setDeleteCheckModalOpen] =
    useState<boolean>(false);
  const { setEntireStudents } = useCourseStudentStore();

  const fetchCourseList = async () => {
    try {
      const { data } = await getTestPapers();
      setCourseListData(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teacherRes, courseRes, studentRes] = await Promise.all([
          getAllTeachers(),
          getTestPapers(),
          getAllStudents(),
        ]);
        setTeacherArr(teacherRes.data);
        setCourseListData(courseRes.data);
        setEntireStudents(studentRes.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="w-full text-center">
      <TestPaperCourseEnrollmentModal
        enrollmentModalOpen={enrollmentModalOpen}
        setEnrollmentModalOpen={setEnrollmentModalOpen}
        onSuccess={fetchCourseList}
        teacherArr={teacherArr}
      />
      <DeleteCheckModal
        deleteCheckModalOpen={deleteCheckModalOpen}
        setDeleteCheckModalOpen={setDeleteCheckModalOpen}
        handleDelete={async () => {
          try {
            await Promise.all(
              deletedCoursesIndex.map((id) => deleteTestPaper(id)),
            );
            await fetchCourseList();
          } catch (e) {
            console.log(e);
          }
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
                ...teacherArr.map((teacher) => teacher.name),
              ]}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <TestPaperCourseList
          testPaperList={courseListData}
          setDeletedCoursesIndex={setDeletedCoursesIndex}
          onSuccess={fetchCourseList}
          teacherArr={teacherArr}
        />
      </div>
    </div>
  );
}

export default TestPaperCourseManagementPage;
