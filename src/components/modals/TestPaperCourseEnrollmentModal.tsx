import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { AiFillEdit } from 'react-icons/ai';
import IconButton from '../atoms/IconButton';
import StudentListByClass from '../organisms/StudentListByClass';
import DropdownMenu from '../molecules/DropdownMenu';
import { TeacherType } from '../../types/teacherType';
import { StudentByGradeType } from '../../types/studentType';
import { enrollTestPaper } from '../../apis/testPaper';
import { useCourseStudentStore } from '../../store/courseStudentsStore';

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

interface TestPaperCourseEnrollmentModalProps {
  enrollmentModalOpen: boolean;
  setEnrollmentModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => Promise<void>;
  teacherArr: TeacherType[];
}

function TestPaperCourseEnrollmentModal({
  enrollmentModalOpen,
  setEnrollmentModalOpen,
  onSuccess,
  teacherArr,
}: TestPaperCourseEnrollmentModalProps) {
  const { entireStudents, entireStudentsNum } = useCourseStudentStore();
  const [selectedTeacherindex, setSelectedTeacherindexIndex] =
    useState<number>(0);
  const [courseName, setCourseName] = useState<string>('');
  const [myStudentsNum, setMyStudentsNum] = useState<number>(0);
  const [differentStudentsNum, setDifferentStudentsNum] = useState<number>(0);
  const [myCourseStudents, setMyCourseStudents] =
    useState<StudentByGradeType[]>(emptyGradeList());
  const [differntCourseStudents, setDifferntCourseStudents] =
    useState<StudentByGradeType[]>(emptyGradeList());

  useEffect(() => {
    if (!enrollmentModalOpen) return;
    setSelectedTeacherindexIndex(0);
    setCourseName('');
    setMyStudentsNum(0);
    setMyCourseStudents(emptyGradeList());
    setDifferentStudentsNum(entireStudentsNum);
    setDifferntCourseStudents(
      entireStudents.map((g) => ({ grade: g.grade, students: [...g.students] })),
    );
  }, [enrollmentModalOpen]);

  const resetModalState = () => {
    setSelectedTeacherindexIndex(0);
    setCourseName('');
    setMyStudentsNum(0);
    setDifferentStudentsNum(entireStudentsNum);
    setMyCourseStudents(emptyGradeList());
    setDifferntCourseStudents(
      entireStudents.map((g) => ({ grade: g.grade, students: [...g.students] })),
    );
  };

  return (
    <ReactModal
      isOpen={enrollmentModalOpen}
      onRequestClose={() => setEnrollmentModalOpen(false)}
      style={customModalStyles}
    >
      <div className="flex flex-col w-full">
        <h1 className="w-full font-bold text-3xl text-center mt-2">반 등록</h1>
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
              value={courseName}
              onChange={(e) => {
                setCourseName(e.target.value);
              }}
            />
          </div>
          <div className="ml-8">
            <DropdownMenu
              textArr={[
                '선택 없음',
                ...teacherArr.map((teacher) => teacher.name),
              ]}
              selectedIndex={selectedTeacherindex}
              setSelectedIndex={setSelectedTeacherindexIndex}
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
              handleClick={async () => {
                if (selectedTeacherindex === 0) {
                  alert('선생님을 선택해주세요');
                  return;
                }
                if (courseName === '') {
                  alert('반 이름을 입력해주세요');
                  return;
                }
                try {
                  const studentIds = myCourseStudents.reduce<number[]>(
                    (acc, grade) => acc.concat(grade.students.map((s) => s.id)),
                    [],
                  );
                  await enrollTestPaper(
                    courseName,
                    teacherArr[selectedTeacherindex - 1].id,
                    studentIds,
                  );
                  await onSuccess();
                  resetModalState();
                  setEnrollmentModalOpen(false);
                } catch (e) {
                  console.log(e);
                  alert('반 등록에 실패했습니다.');
                }
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

export default TestPaperCourseEnrollmentModal;
