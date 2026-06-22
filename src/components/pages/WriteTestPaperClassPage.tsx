import { useEffect, useState } from 'react';
import { SetURLSearchParams, useNavigate } from 'react-router-dom';
import { AiFillEdit, AiOutlineFolder } from 'react-icons/ai';
import DropdownMenu from '../molecules/DropdownMenu';
import IconButton from '../atoms/IconButton';
import DeleteCheckModal from '../modals/DeleteCheckModal';
import getDirectory from '../../apis/directory';
import { TestPaperType } from '../../types/testPaperType';
import { getTestPapers } from '../../apis/testPaper';
import {
  createTestPaperLecture,
  getTestPaperLectureByTestPaperId,
  updateTestPaperLecture,
  deleteTestPaperLecture,
} from '../../apis/testPaperLecture';
import { TestPaperLectureVideoType } from '../../types/testPaperLectureType';

interface WriteTestPaperClassPageProps {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

const loadVideosFromDirectory = async (path: string): Promise<string[]> => {
  if (!path.trim()) return [''];

  const { data } = await getDirectory(path.trim());
  const videoFiles = data.filter((item: { isDir: boolean }) => !item.isDir);

  let maxNum = 0;
  videoFiles.forEach((item: { fileName: string }) => {
    const nameWithoutExt =
      item.fileName.indexOf('.') !== -1
        ? item.fileName.substring(0, item.fileName.lastIndexOf('.'))
        : item.fileName;
    const num = Number(nameWithoutExt);
    if (
      nameWithoutExt.trim() !== '' &&
      Number.isFinite(num) &&
      Number.isInteger(num) &&
      num >= 1
    ) {
      maxNum = Math.max(maxNum, num);
    }
  });

  if (maxNum === 0) return [''];

  const newLinks: string[] = Array(maxNum).fill('');
  videoFiles.forEach((item: { fileName: string; path: string }) => {
    const nameWithoutExt =
      item.fileName.indexOf('.') !== -1
        ? item.fileName.substring(0, item.fileName.lastIndexOf('.'))
        : item.fileName;
    const num = Number(nameWithoutExt);
    if (
      nameWithoutExt.trim() !== '' &&
      Number.isFinite(num) &&
      Number.isInteger(num) &&
      num >= 1 &&
      num <= maxNum
    ) {
      newLinks[num - 1] = item.path;
    }
  });

  return newLinks;
};

function WriteTestPaperClassPage({
  searchParams,
  setSearchParams,
}: WriteTestPaperClassPageProps) {
  const [selectedClassindex, setSelectedClassindex] = useState<number>(
    Number(searchParams.get('classIndex') ?? 0),
  );
  const [courses, setCourses] = useState<TestPaperType[]>([]);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [lectureId, setLectureId] = useState<number | null>(null);
  const [deleteCheckModalOpen, setDeleteCheckModalOpen] =
    useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [videoLinks, setVideoLinks] = useState<string[]>(['']);
  const [folderPath, setFolderPath] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const pathFromUrl = searchParams.get('folderPath');
    if (!pathFromUrl) return;

    setFolderPath(pathFromUrl);

    const newParams = new URLSearchParams(searchParams);
    newParams.delete('folderPath');
    setSearchParams(newParams, { replace: true });

    loadVideosFromDirectory(pathFromUrl)
      .then((links) => {
        if (links.length === 1 && links[0] === '') {
          alert('숫자 파일명의 영상을 찾을 수 없습니다.');
          return;
        }
        setVideoLinks(links);
      })
      .catch((e: unknown) => {
        const serverMessage = (
          e as { response?: { data?: { errorDescription?: string } } }
        )?.response?.data?.errorDescription;
        alert(serverMessage ?? '영상을 불러오는 데 실패했습니다.');
      });
  }, [searchParams]);

  useEffect(() => {
    getTestPapers()
      .then(({ data }) => setCourses(data))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    if (courses.length === 0) return;
    const testPaperId = courses[selectedClassindex]?.testPaperId;
    if (!testPaperId) return;

    setIsCreated(false);
    setLectureId(null);
    setTitle('');
    setDescription('');
    setVideoLinks(['']);
    setFolderPath('');

    getTestPaperLectureByTestPaperId(testPaperId)
      .then(({ data }) => {
        setTitle(data.lectureName ?? '');
        setDescription(data.description ?? '');
        setFolderPath(data.directoryPath ?? '');
        setLectureId(data.lectureId);

        const videos: TestPaperLectureVideoType[] = data.videos ?? [];
        let maxNum = 0;
        videos.forEach((v) => {
          const nameWithoutExt = v.fileName.indexOf('.') !== -1
            ? v.fileName.substring(0, v.fileName.lastIndexOf('.'))
            : v.fileName;
          const num = Number(nameWithoutExt);
          if (Number.isFinite(num) && Number.isInteger(num) && num >= 1) {
            maxNum = Math.max(maxNum, num);
          }
        });
        if (maxNum > 0) {
          const links: string[] = Array(maxNum).fill('');
          videos.forEach((v) => {
            const nameWithoutExt = v.fileName.indexOf('.') !== -1
              ? v.fileName.substring(0, v.fileName.lastIndexOf('.'))
              : v.fileName;
            const num = Number(nameWithoutExt);
            if (Number.isFinite(num) && Number.isInteger(num) && num >= 1 && num <= maxNum) {
              links[num - 1] = v.path;
            }
          });
          setVideoLinks(links);
        }

        setIsCreated(true);
      })
      .catch(() => {
        // 강의 없음 — 빈 폼 유지
      });
  }, [selectedClassindex, courses]);

  const handleVideoLinkChange = (index: number, value: string) => {
    setVideoLinks((prev) =>
      prev.map((link, i) => (i === index ? value : link)),
    );
  };

  const handleCreate = async () => {
    if (title.trim() === '') {
      alert('문제집 이름을 입력해주세요.');
      return;
    }
    const testPaperId = courses[selectedClassindex]?.testPaperId;
    if (!testPaperId) {
      alert('시험지 반을 선택해주세요.');
      return;
    }
    try {
      await createTestPaperLecture(testPaperId, title, description, folderPath);
      const { data } = await getTestPaperLectureByTestPaperId(testPaperId);
      setLectureId(data.lectureId);
      setIsCreated(true);
    } catch (e) {
      alert('수업 생성에 실패했습니다.');
    }
  };

  const handleUpdate = async () => {
    if (lectureId === null) return;
    if (title.trim() === '') {
      alert('문제집 이름을 입력해주세요.');
      return;
    }
    try {
      await updateTestPaperLecture(lectureId, title, description, folderPath);
      alert('수정되었습니다.');
    } catch (e) {
      alert('수업 수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (lectureId === null) return;
    try {
      await deleteTestPaperLecture(lectureId);
    } catch (e) {
      alert('수업 삭제에 실패했습니다.');
      setDeleteCheckModalOpen(false);
      return;
    }
    setIsCreated(false);
    setLectureId(null);
    setTitle('');
    setDescription('');
    setVideoLinks(['']);
    setFolderPath('');
    setDeleteCheckModalOpen(false);
  };

  return (
    <div className="mx-auto">
      <DeleteCheckModal
        deleteCheckModalOpen={deleteCheckModalOpen}
        setDeleteCheckModalOpen={setDeleteCheckModalOpen}
        handleDelete={handleDelete}
      />

      <div className="flex justify-center mt-4">
        <DropdownMenu
          type="search"
          size="long"
          textArr={courses.map((course: TestPaperType) => course.testPaperName)}
          selectedIndex={selectedClassindex}
          setSelectedIndex={setSelectedClassindex}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>

      <div className="flex flex-col items-center mt-6 w-[600px] mx-auto">
        {/* 문제집 이름 */}
        <div className="flex items-center w-full mb-4">
          <label
            htmlFor="testPaperTitle"
            className="font-bold text-lg w-[100px] shrink-0"
          >
            문제집 이름
          </label>
          <input
            id="testPaperTitle"
            type="text"
            className="flex-1 h-[40px] border-solid border-black border-[1.3px] rounded-md pl-3 text-sm font-bold"
            placeholder="이름을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 문제집 설명 */}
        <div className="flex items-start w-full mb-6">
          <label
            htmlFor="testPaperDescription"
            className="font-bold text-lg w-[100px] shrink-0 pt-2"
          >
            문제집 설명
          </label>
          <textarea
            id="testPaperDescription"
            className="flex-1 h-[80px] border-solid border-black border-[1.3px] rounded-md p-3 text-sm font-bold resize-none"
            placeholder="설명을 입력해주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* 문항별 영상 링크 */}
        <div className="w-full border-t border-gray-300 pt-4">
          {/* 폴더 자동 매핑 */}
          <div className="flex items-center gap-2 mb-4">
            <AiOutlineFolder size="20px" className="shrink-0 text-gray-500" />
            <input
              type="text"
              className="flex-1 h-[36px] border-solid border-gray-400 border-[1px] rounded-md pl-3 text-sm"
              placeholder="폴더 경로 입력 (예: /teachers/김선우)"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
            />
            <button
              type="button"
              className="shrink-0 h-[36px] px-3 text-sm font-bold border border-gray-400 rounded-md hover:bg-gray-100"
              onClick={() =>
                navigate(
                  `/vedio-management?breadscrum=/&returnTo=/enroll-class&returnClassIndex=${selectedClassindex}&returnClassType=testpaper`,
                )
              }
            >
              영상 불러오기
            </button>
          </div>

          <div className="flex items-center mb-3">
            <span className="font-bold text-lg w-[100px] shrink-0">문항</span>
            <span className="font-bold text-lg flex-1 text-center">
              풀이 영상 링크
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
            {videoLinks.map((link, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={`question-${index}`} className="flex items-center gap-2">
                <span className="font-bold text-sm w-[100px] shrink-0 text-center text-hpGray">
                  문항 {index + 1}
                </span>
                <input
                  type="text"
                  className="flex-1 h-[36px] border-solid border-gray-400 border-[1px] rounded-md pl-3 text-sm"
                  placeholder="영상 링크를 입력해주세요."
                  value={link}
                  onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-4 mt-6 mb-8">
          {!isCreated ? (
            <IconButton
              bgColor="white"
              icon={<AiFillEdit size="20px" />}
              text="수업 생성"
              handleClick={handleCreate}
            />
          ) : (
            <>
              <IconButton
                bgColor="blue"
                icon={<AiFillEdit size="20px" color="white" />}
                text="수업 수정"
                handleClick={handleUpdate}
              />
              <IconButton
                bgColor="white"
                icon={<AiFillEdit size="20px" />}
                text="수업 삭제"
                handleClick={() => setDeleteCheckModalOpen(true)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WriteTestPaperClassPage;
