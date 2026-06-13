import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { AiFillEdit } from 'react-icons/ai';
import IconButton from '../atoms/IconButton';
import StudentListByClass from '../organisms/StudentListByClass';
import DropdownMenu from '../molecules/DropdownMenu';
import { CourseType } from '../../types/courseType';
import { TeacherType } from '../../types/teacherType';
import { StudentByGradeType } from '../../types/studentType';

const customModalStyles: ReactModal.Styles = {
  overlay: {
    backgroundColor: ' rgba(0, 0, 0, 0.4)',
    width: '100%',
    height: '100vh',
    zIndex: '10',
    position: 'fixed',
    top: '0',
    left: '0',
  },
  content: {
    width: '750px',
    height: '800px',
    zIndex: '150',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '10px',
    boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.25)',
    backgroundColor: 'white',
    justifyContent: 'center',
    overflow: 'auto',
  },
};

const emptyGradeList = (): StudentByGradeType[] =>
  Array.from({ length: 12 }, (_, i) => ({ grade: i, students: [] }));

interface TestPaperCourseModificationModalProps {
  enrollmentModalOpen: boolean;
  setEnrollmentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCourseListData: React.Dispatch<React.SetStateAction<CourseType[]>>;
  courseId: number;
  initialCourseName: string;
  initialTeacherName: string;
  teacherArr: TeacherType[];
  selectedIndex: number;
}

function TestPaperCourseModificationModal({
  enrollmentModalOpen,
  setEnrollmentModalOpen,
  setCourseListData,
  courseId,
  initialCourseName,
  initialTeacherName,
  teacherArr,
  selectedIndex,
}: TestPaperCourseModificationModalProps) {
  const [selectedTeacherindex, setSelectedTeacherindex] = useState<number>(0);
  const [courseName, setCourseName] = useState<string>(initialCourseName);
  const [myStudentsNum, setMyStudentsNum] = useState<number>(0);
  const [differentStudentsNum, setDifferentStudentsNum] = useState<number>(0);
  const [myCourseStudents, setMyCourseStudents] = useState<StudentByGradeType[]>(
    emptyGradeList(),
  );
  const [differntCourseStudents, setDifferntCourseStudents] = useState<
    StudentByGradeType[]
  >(emptyGradeList());

  useEffect(() => {
    if (enrollmentModalOpen) {
      setCourseName(initialCourseName);
      const idx = teacherArr.findIndex((t) => t.name === initialTeacherName);
      setSelectedTeacherindex(idx >= 0 ? idx + 1 : 0);
    }
  }, [enrollmentModalOpen]);

  const resetModalState = () => {
    setCourseName(initialCourseName);
    const idx = teacherArr.findIndex((t) => t.name === initialTeacherName);
    setSelectedTeacherindex(idx >= 0 ? idx + 1 : 0);
    setMyStudentsNum(0);
    setDifferentStudentsNum(0);
    setMyCourseStudents(emptyGradeList());
    setDifferntCourseStudents(emptyGradeList());
  };

  return (
    <ReactModal
      isOpen={enrollmentModalOpen}
      onRequestClose={() => setEnrollmentModalOpen(false)}
      style={customModalStyles}
    >
      <div className="flex flex-col w-full">
        <h1 className="w-full font-bold text-3xl text-center mt-2">반 수정</h1>
        <div className="flex items-center w-full justify-center mt-5">
          <div className="flex items-center mr-8">
            <label
              className="font-bold text-xl w-[70px] mr-2"
              htmlFor="classModalName"
            >
              반 이름
            </label>
            <input
              type="text"
              className="w-[180px] h-[40px] border-solid border-black border-[1.3px] rounded-md pl-2 text-sm font-bold"
              id="classModalName"
              placeholder="이름을 입력해주세요."
              onChange={(e) => {
                setCourseName(e.target.value);
              }}
              value={courseName}
            />
          </div>
          <div className="ml-8">
            <DropdownMenu
              textArr={[
                '선택 없음',
                ...teacherArr.map((teacher) => teacher.name),
              ]}
              selectedIndex={selectedTeacherindex}
              setSelectedIndex={setSelectedTeacherindex}
            />
          </div>
        </div>
        <hr className="h-[1px] border-0 bg-hpGray w-[600px] mx-auto mt-5" />
        <div className="flex justify-center mt-4">
          <div className="mr-4 w-[280px]">
            <div className="flex items-center border-[1.1px] border-solid border-hpGray mb-3 mx-auto w-[180px]">
              <span className="w-[142px] text-center font-bold text-lg">
                전체 학생
              </span>
              <div className="bg-hpGray w-[45px] h-[38px] leading-[38px] font-bold text-center">
                {differentStudentsNum}명
              </div>
            </div>
            <StudentListByClass
              type="entire"
              differntCourseStudents={differntCourseStudents}
              myCourseStudents={myCourseStudents}
              setDifferntCourseStudents={setDifferntCourseStudents}
              setMyCourseStudents={setMyCourseStudents}
              setMyStudentsNum={setMyStudentsNum}
              setDifferentStudentsNum={setDifferentStudentsNum}
            />
          </div>
          <div className="ml-4 w-[280px]">
            <div className="flex items-center border-[1.1px] border-solid border-hpGray mb-3 mx-auto w-[180px]">
              <span className="w-[142px] text-center font-bold text-lg">
                선택 된 학생
              </span>
              <div className="bg-hpGray w-[45px] h-[38px] leading-[38px] font-bold text-center">
                {myStudentsNum}명
              </div>
            </div>
            <StudentListByClass
              type="other"
              differntCourseStudents={differntCourseStudents}
              myCourseStudents={myCourseStudents}
              setDifferntCourseStudents={setDifferntCourseStudents}
              setMyCourseStudents={setMyCourseStudents}
              setMyStudentsNum={setMyStudentsNum}
              setDifferentStudentsNum={setDifferentStudentsNum}
            />
          </div>
        </div>
        <div className="flex w-full justify-center mt-6">
          <div className="mr-4">
            <IconButton
              bgColor="white"
              icon={<AiFillEdit size="20px" />}
              text="완료"
              handleClick={() => {
                if (courseName === '') {
                  alert('반 이름을 입력해주세요');
                  return;
                }
                const selectedTeacher =
                  selectedTeacherindex > 0
                    ? teacherArr[selectedTeacherindex - 1]
                    : null;
                setCourseListData((prev) =>
                  prev.map((course) =>
                    course.courseId === courseId
                      ? {
                          ...course,
                          courseName,
                          studentSize: myStudentsNum,
                          teacherPreview: selectedTeacher
                            ? {
                                teacherId: selectedTeacher.id,
                                teacherName: selectedTeacher.name,
                              }
                            : course.teacherPreview,
                        }
                      : course,
                  ),
                );
                resetModalState();
                setEnrollmentModalOpen(false);
              }}
            />
          </div>
          <div className="ml-4">
            <IconButton
              bgColor="white"
              icon={<AiFillEdit size="20px" />}
              text="취소"
              handleClick={() => {
                resetModalState();
                setEnrollmentModalOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </ReactModal>
  );
}

export default TestPaperCourseModificationModal;
