import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getOwnCourses } from '../../apis/course';
import { getLessonsByClassId } from '../../apis/lesson';
import DateSelector from '../molecules/DateSelector';
import CategoryDropdown from '../molecules/CategoryDropdown';
import LessonList from '../organisms/LessonList';
import Pagenation from '../organisms/Pagenation';
import DropdownMenu from '../molecules/DropdownMenu';
import { getOwnOnlineCourses } from '../../apis/onlineCourse';
import { getTestPapers } from '../../apis/testPaper';
import { getTestPaperLectureByTestPaperId } from '../../apis/testPaperLecture';
import { TestPaperLectureType } from '../../types/testPaperLectureType';
import OnlineLessonList from '../organisms/OnlineLessonList';
import { CourseType } from '../../types/courseType';
import { TestPaperType } from '../../types/testPaperType';
import { PageInfoType } from '../../types/page';
import { OfflineLessonType } from '../../types/offlineLessonType';

const categoryData = ['날짜', '이름'];

function MyClassPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courseList, setCourseList] = useState<CourseType[]>([]);
  const [selectedClassindex, setSelectedClassindex] = useState<number>(
    Number(searchParams.get('classIndex')),
  );
  const [selectedCategoryindex, setSelectedCategoryindex] = useState<number>(
    Number(searchParams.get('sortIndex')),
  );
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [lessons, setLessons] = useState<OfflineLessonType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageInfo, setPageInfo] = useState<PageInfoType>({
    totalItemSize: 0,
    currentPage: 0,
    pageSize: 8,
  });
  const [testPaperLecture, setTestPaperLecture] =
    useState<TestPaperLectureType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offlineRes, onlineRes, testPaperRes] = await Promise.all([
          getOwnCourses(),
          getOwnOnlineCourses(),
          getTestPapers(),
        ]);
        const offlineCourses = offlineRes.data.map((course: CourseType) => ({
          ...course,
          type: 'offline',
        }));
        const onlineCourses = onlineRes.data.map((course: CourseType) => ({
          ...course,
          type: 'online',
        }));
        const testPaperCourses = testPaperRes.data.map((tp: TestPaperType) => ({
          courseId: tp.testPaperId,
          courseName: tp.testPaperName,
          teacherPreview: { teacherName: tp.teacherName, teacherId: tp.teacherId },
          studentSize: tp.studentCount,
          type: 'testPaper',
        }));
        const combined = [...offlineCourses, ...onlineCourses, ...testPaperCourses];
        setCourseList(combined);

        const firstType = combined[0]?.type ?? 'offline';
        searchParams.set('courseType', firstType);
        setSearchParams(searchParams);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (courseList.length > 0) {
        try {
          if (courseList[selectedClassindex]?.type === 'offline') {
            const { data } = await getLessonsByClassId(
              courseList[selectedClassindex].courseId,
              selectedCategoryindex,
              page - 1,
            );
            setLessons(data.data);
            setPageInfo(data.pageInfo);
          }
        } catch (e) {
          console.log(e);
        }
      }
    };
    fetchData();
  }, [selectedClassindex, selectedCategoryindex, courseList, page]);

  useEffect(() => {
    const type = courseList[selectedClassindex]?.type;
    if (type === 'offline' || type === 'online' || type === 'testPaper') {
      searchParams.set('courseType', type);
      setSearchParams(searchParams);
    }
  }, [courseList, selectedClassindex]);

  useEffect(() => {
    if (courseList[selectedClassindex]?.type !== 'testPaper') {
      setTestPaperLecture(null);
      return;
    }
    const testPaperId = courseList[selectedClassindex].courseId;
    getTestPaperLectureByTestPaperId(testPaperId)
      .then(({ data }) => setTestPaperLecture(data))
      .catch(() => setTestPaperLecture(null));
  }, [selectedClassindex, courseList]);

  console.log(courseList);
  if (courseList.length === 0)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-157px)] bg-gray-100">
        <div className="p-8 bg-white shadow-xl rounded-2xl border border-gray-200 mb-36">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            등록된 수업이 없습니다.
          </h1>
        </div>
      </div>
    );
  return (
    <div>
      <div className="flex justify-center mt-2">
        <DropdownMenu
          type="search"
          size="long"
          textArr={courseList.map((course) => course.courseName)}
          selectedIndex={selectedClassindex}
          setSelectedIndex={setSelectedClassindex}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>
      {searchParams.get('courseType') === 'offline' && (
        <div className="relative flex justify-center mt-[12px]">
          <div className="mr-4">
            <DateSelector
              startDate={startDate}
              setStartDate={setStartDate}
              courseList={courseList}
              selectedClassindex={selectedClassindex}
            />
          </div>
          <div className="ml-4">
            <CategoryDropdown
              textArr={categoryData}
              selectedIndex={selectedCategoryindex}
              setSelectedIndex={setSelectedCategoryindex}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </div>
        </div>
      )}
      {searchParams.get('courseType') === 'offline' && (
        <LessonList
          lessons={lessons}
          courseList={courseList}
          selectedClassindex={selectedClassindex}
        />
      )}
      {searchParams.get('courseType') === 'online' && (
        <OnlineLessonList
          teacherName={
            courseList[selectedClassindex].teacherPreview.teacherName
          }
          courseList={courseList}
          selectedClassindex={selectedClassindex}
          onlineCourseId={courseList[selectedClassindex].courseId}
        />
      )}
      {searchParams.get('courseType') === 'testPaper' && (
        <div className="flex flex-col items-center mt-8 gap-2">
          <span className="text-xl font-bold">
            {courseList[selectedClassindex]?.courseName}
          </span>
          <span className="text-lg text-hpGray">
            담당 선생님:{' '}
            {courseList[selectedClassindex]?.teacherPreview?.teacherName}
          </span>
          {testPaperLecture ? (
            <div className="mt-4 w-full max-w-[600px]">
              <p className="text-lg font-bold text-center">
                {testPaperLecture.lectureName}
              </p>
              {testPaperLecture.description && (
                <p className="text-sm text-gray-500 text-center mt-1">
                  {testPaperLecture.description}
                </p>
              )}
              <div className="mt-6 grid grid-cols-5 gap-3">
                {testPaperLecture.videos.map((video, i) => (
                  <Link
                    key={video.path || String(i)}
                    to={`/test-paper-lesson?lectureId=${testPaperLecture.lectureId}&questionIndex=${i + 1}&lectureName=${encodeURIComponent(testPaperLecture.lectureName)}&testPaperName=${encodeURIComponent(testPaperLecture.testPaperName)}`}
                    className={`flex items-center justify-center h-12 rounded-lg border-2 font-bold text-sm transition-colors ${
                      video.path
                        ? 'border-hpBlue text-hpBlue hover:bg-hpBlue hover:text-white'
                        : 'border-gray-200 text-gray-300 pointer-events-none'
                    }`}
                  >
                    문항 {i + 1}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-gray-400">등록된 수업이 없습니다.</p>
          )}
        </div>
      )}

      {searchParams.get('courseType') === 'offline' && (
        <div className="w-[360px] mx-auto my-1">
          <Pagenation
            page={page}
            setPage={setPage}
            totalItemNumbers={pageInfo?.totalItemSize}
            itemNumPerPage={8}
          />
        </div>
      )}
    </div>
  );
}

export default MyClassPage;
