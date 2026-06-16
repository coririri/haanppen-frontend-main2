import { useEffect, useState } from 'react';
import { SetURLSearchParams } from 'react-router-dom';
import { AiFillEdit, AiOutlineFolder } from 'react-icons/ai';
import DropdownMenu from '../molecules/DropdownMenu';
import IconButton from '../atoms/IconButton';
import DeleteCheckModal from '../modals/DeleteCheckModal';
import getDirectory from '../../apis/directory';
import { TestPaperType } from '../../types/testPaperType';
import { getTestPapers } from '../../apis/testPaper';

interface WriteTestPaperClassPageProps {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}

interface TestPaperData {
  title: string;
  description: string;
  videoLinks: string[];
}

function WriteTestPaperClassPage({
  searchParams,
  setSearchParams,
}: WriteTestPaperClassPageProps) {
  const [selectedClassindex, setSelectedClassindex] = useState<number>(
    Number(searchParams.get('classIndex') ?? 0),
  );
  const [courses, setCourses] = useState<TestPaperType[]>([]);
  const [isCreated, setIsCreated] = useState<boolean>(false);

  useEffect(() => {
    getTestPapers()
      .then(({ data }) => setCourses(data))
      .catch((e) => console.log(e));
  }, []);
  const [deleteCheckModalOpen, setDeleteCheckModalOpen] =
    useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [videoLinks, setVideoLinks] = useState<string[]>(['']);
  const [folderPath, setFolderPath] = useState<string>('');

  const [savedData, setSavedData] = useState<TestPaperData | null>(null);

  const handleVideoLinkChange = (index: number, value: string) => {
    setVideoLinks((prev) =>
      prev.map((link, i) => (i === index ? value : link)),
    );
  };

  const handleLoadVideos = async () => {
    if (folderPath.trim() === '') {
      alert('폴더 경로를 입력해주세요.');
      return;
    }
    try {
      const { data } = await getDirectory(folderPath.trim());
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

      if (maxNum === 0) {
        alert('숫자 파일명의 영상을 찾을 수 없습니다.');
        return;
      }

      const newLinks = Array(maxNum).fill('');
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

      setVideoLinks(newLinks);
    } catch (e) {
      alert('폴더를 불러오는 데 실패했습니다. 경로를 확인해주세요.');
    }
  };

  const handleCreate = () => {
    if (title.trim() === '') {
      alert('문제집 이름을 입력해주세요.');
      return;
    }
    setSavedData({ title, description, videoLinks: [...videoLinks] });
    setIsCreated(true);
  };

  const handleDelete = () => {
    setIsCreated(false);
    setSavedData(null);
    setTitle('');
    setDescription('');
    setVideoLinks(['']);
    setFolderPath('');
    setDeleteCheckModalOpen(false);
  };

  const displayLinks = isCreated ? (savedData?.videoLinks ?? []) : videoLinks;

  return (
    <div className="mx-auto">
      <DeleteCheckModal
        deleteCheckModalOpen={deleteCheckModalOpen}
        setDeleteCheckModalOpen={setDeleteCheckModalOpen}
        handleDelete={async () => handleDelete()}
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
            className="flex-1 h-[40px] border-solid border-black border-[1.3px] rounded-md pl-3 text-sm font-bold disabled:bg-gray-100"
            placeholder="이름을 입력해주세요."
            value={isCreated ? (savedData?.title ?? '') : title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isCreated}
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
            className="flex-1 h-[80px] border-solid border-black border-[1.3px] rounded-md p-3 text-sm font-bold resize-none disabled:bg-gray-100"
            placeholder="설명을 입력해주세요."
            value={isCreated ? (savedData?.description ?? '') : description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isCreated}
          />
        </div>

        {/* 문항별 영상 링크 */}
        <div className="w-full border-t border-gray-300 pt-4">
          {/* 폴더 자동 매핑 */}
          <div className="flex items-center gap-2 mb-4">
            <AiOutlineFolder size="20px" className="shrink-0 text-gray-500" />
            <input
              type="text"
              className="flex-1 h-[36px] border-solid border-gray-400 border-[1px] rounded-md pl-3 text-sm disabled:bg-gray-100"
              placeholder="폴더 경로 입력 (예: /teachers/김선우)"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              disabled={isCreated}
            />
            <button
              type="button"
              className="shrink-0 h-[36px] px-3 text-sm font-bold border border-gray-400 rounded-md hover:bg-gray-100 disabled:opacity-30"
              onClick={handleLoadVideos}
              disabled={isCreated}
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
            {displayLinks.map((link, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={`question-${link}`} className="flex items-center gap-2">
                <span className="font-bold text-sm w-[100px] shrink-0 text-center text-hpGray">
                  문항 {index + 1}
                </span>
                <input
                  type="text"
                  className="flex-1 h-[36px] border-solid border-gray-400 border-[1px] rounded-md pl-3 text-sm disabled:bg-gray-100"
                  placeholder="영상 링크를 입력해주세요."
                  value={link}
                  onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                  disabled={isCreated}
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
            <IconButton
              bgColor="white"
              icon={<AiFillEdit size="20px" />}
              text="수업 삭제"
              handleClick={() => setDeleteCheckModalOpen(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default WriteTestPaperClassPage;
