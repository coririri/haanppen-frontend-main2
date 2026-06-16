import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AiOutlineRight } from 'react-icons/ai';
import { CgLayoutList, CgLayoutGrid } from 'react-icons/cg';
import TextButton from '../atoms/TextButton';
import Folder from '../molecules/Folder';
import VideoFile from '../molecules/ViedoFile';
import FileDetailTab from '../molecules/FileDetailTab';
import FolderDetailTab from '../molecules/FolderDetailTab';
import getDirectory, { deleteDirectory } from '../../apis/directory';
import CreateFolderModal from '../modals/CreateFolderModal';
import enrollVideo, { deleteVideo } from '../../apis/video';
import VideoUploadingModal from '../modals/VideoUploadingModal';
import DeleteCheckModal from '../modals/DeleteCheckModal';
import ErrorConfirmModal from '../modals/ErrorConfirmModal';
import { DirectoryType } from '../../types/directoryType';
import { LoadingType } from '../../types/loadingType';
// import enrollVideo from '../../apis/video';

function VedioManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const breadscrumb = searchParams.get('breadscrum') || '/'; // 기본값을 "홈"으로 설정
  const [directoryError, setDirectoryError] = useState<string>('');

  const [breadscrumArray, setBreadscrumArray] = useState<string[]>([
    breadscrumb,
    '09.12',
  ]); // breadscrum을 List로 가지고 있는 상태 값
  const [directoryDatas, setDirectoryDatas] = useState<DirectoryType[]>([]); // 현재 UI상의 디렉토리 데이터 상태 값
  const [isFolderCreateModalOpen, setIsFolderCreateModalOpen] =
    useState<boolean>(false); // 디렉토리 생성 모달 Open 상태 값
  const [checkedDirectoryArr, setCheckedDirectoryArr] = useState<number[]>([]); // 선택된 디렉토리 리스트를 위한 데이터를 디렉토리 이름으로 가지고 있는 리스트 상태 값
  const [uploadingInfoList, setUploadingInfoList] = useState<LoadingType[]>([]);
  const [isVideoUploadingModalOpen, setIsVideoUploadingModalOpen] =
    useState<boolean>(false);
  const [deleteFolderCheckModalOpen, setDeleteFolderCheckModalOpen] =
    useState<boolean>(false);
  const [deleteVideoCheckModalOpen, setDeleteVideoCheckModalOpen] =
    useState<boolean>(false);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [uiStatus, setUiStatus] = useState<'line' | 'grid'>('line');
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'date';
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });

  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async (absolutePath: string) => {
      try {
        const { data } = await getDirectory(absolutePath);
        setDirectoryDatas(data);
        setDirectoryError('');
      } catch (e) {
        console.log(e);
        // 에러 종류에 따라 권한 없음, fetch 못함으로 나누자
        setDirectoryError('권한 없음');
      }
    };

    const breadscrumbString = searchParams.get('breadscrum') || '';
    setBreadscrumArray(breadscrumbString.split('_'));
    const curSearchPrams = breadscrumbString.split('_');

    const absolutePath = curSearchPrams.join('/');
    if (absolutePath !== '/') fetchData(absolutePath.slice(1));
    else fetchData(absolutePath);
  }, [searchParams.get('breadscrum')]); // 브레드 스크럼이 바뀔때마다 directoryDatas값을 서버로 부터 받아옴

  const handleDeleteDirectory = async (targetDirectory: string) => {
    try {
      const absolutePath = breadscrumArray.join('/');
      if (absolutePath !== '/') {
        await deleteDirectory(`${absolutePath.slice(1)}/${targetDirectory}`);
      } else {
        await deleteDirectory(`${absolutePath}${targetDirectory}`);
      }
    } catch (e) {
      console.log(e);
    }
  }; // 개별 디렉토리를 삭제하는 메서드

  // 영상 길이 구하는 함수
  const getVideoDuration = (file: File): Promise<number> =>
    new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        resolve(video.duration); // 영상 길이 반환
        URL.revokeObjectURL(video.src); // 메모리 누수 방지
      };
    });

  const handleEnrollVideo = async () => {
    if (videoRef.current === null || videoRef.current.files === null) return;
    const files = Array.from(videoRef.current.files);
    if (files.length === 0) return;

    const chunkSize = 1024 * 1024; // 1MB
    const tempAbsolutePath = breadscrumArray.join('/');
    const absolutePath =
      tempAbsolutePath !== '/' ? tempAbsolutePath.slice(1) : tempAbsolutePath;

    setUploadingInfoList(
      files.map((file) => ({
        fileName: file.name,
        current: 0,
        end: Math.ceil(file.size / chunkSize),
      })),
    );
    setIsVideoUploadingModalOpen(true);

    const uploadFile = async (file: File, fileIndex: number) => {
      const videoRuntime = await getVideoDuration(file);
      const totalChunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;

      const sendNextChunk = async (): Promise<void> => {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        const nameParts = file.name.split('.');
        nameParts.pop();
        const chunkInfo = {
          targetDirectoryPath: absolutePath,
          fileName: nameParts.join('.') ?? '기본',
          totalChunkCount: file.size,
          currChunkIndex: start === 0 ? 0 : start + 1,
          isLast: totalChunks - 1 === currentChunk,
          extension: '.mp4',
          mediaDuration: videoRuntime,
        };
        formData.append('media', chunk);
        formData.append(
          'info',
          new Blob([JSON.stringify(chunkInfo)], { type: 'application/json' }),
        );

        try {
          const response = await enrollVideo(formData);

          if (response.status === 202) {
            currentChunk += 1;
            setUploadingInfoList((prev) =>
              prev.map((item, i) =>
                i === fileIndex ? { ...item, current: currentChunk } : item,
              ),
            );
            await sendNextChunk();
          }
        } catch (e: unknown) {
          if (e instanceof Error && 'response' in e) {
            const errorResponse = (e as any).response;

            if (errorResponse && errorResponse.status === 406) {
              const { nextChunkIndex, remainSize } = errorResponse.data;
              if (remainSize === 0) {
                // 서버가 모든 데이터를 수신했으나 isLast=true를 요구하는 경우
                currentChunk = totalChunks - 1;
              } else {
                currentChunk = Math.round((nextChunkIndex - 1) / chunkSize);
              }
              setUploadingInfoList((prev) =>
                prev.map((item, i) =>
                  i === fileIndex ? { ...item, current: currentChunk } : item,
                ),
              );
              await sendNextChunk();
            } else {
              console.log('알 수 없는 에러:', e);
              alert(`${file.name} 업로드에 실패했습니다.`);
            }
          } else {
            console.log('알 수 없는 에러:', e);
            alert(`${file.name} 업로드에 실패했습니다.`);
          }
        }
      };

      await sendNextChunk();
    };

    try {
      for (let i = 0; i < files.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await uploadFile(files[i], i);
      }
      setIsVideoUploadingModalOpen(false);
      alert('파일 전송이 끝났습니다');
      try {
        const { data } = await getDirectory(absolutePath);
        setDirectoryDatas(data);
      } catch (e) {
        console.log(e);
      }
    } catch (e) {
      console.log(e);
      setIsVideoUploadingModalOpen(false);
    }
  };

  const handleSort = (key: 'name' | 'date') => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const sortedDirectoryDatas = [...directoryDatas].sort((a, b) => {
    if (sortConfig.key === 'name') {
      const cmp = a.fileName.localeCompare(b.fileName, 'ko');
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    }
    const cmp = a.createdTime.localeCompare(b.createdTime);
    return sortConfig.direction === 'asc' ? cmp : -cmp;
  });

  console.log(breadscrumArray);

  return (
    <div>
      <DeleteCheckModal
        deleteCheckModalOpen={deleteFolderCheckModalOpen}
        setDeleteCheckModalOpen={setDeleteFolderCheckModalOpen}
        handleDelete={async () => {
          if (directoryError !== '') {
            alert('뒤로 가기를 눌러주세요');
            return;
          }
          let deletedDirectory = checkedDirectoryArr.map(
            (value) => sortedDirectoryDatas[value].fileName,
          );
          try {
            for (let i = 0; i < checkedDirectoryArr.length; i += 1) {
              if (sortedDirectoryDatas[checkedDirectoryArr[i]].isDir === true) {
                const deletedForName =
                  sortedDirectoryDatas[checkedDirectoryArr[i]].fileName;
                await handleDeleteDirectory(deletedForName);
                deletedDirectory = deletedDirectory.filter(
                  (value) =>
                    sortedDirectoryDatas[checkedDirectoryArr[i]].fileName !== value,
                );
              }
            }

            const absolutePath = breadscrumArray.join('/');
            if (absolutePath !== '/') {
              const { data } = await getDirectory(absolutePath.slice(1));

              setDirectoryDatas(data);
              setCheckedDirectoryArr(
                data
                  .map((directory: DirectoryType, index: number) => {
                    if (deletedDirectory.indexOf(directory.fileName) !== -1)
                      return index;
                    return null;
                  })
                  .filter((value: null | number) => value !== null),
              );
            } else {
              const { data } = await getDirectory(absolutePath);

              setDirectoryDatas(data);
              setCheckedDirectoryArr(
                data
                  .map((directory: DirectoryType, index: number) => {
                    if (deletedDirectory.indexOf(directory.fileName) !== -1)
                      return index;
                    return null;
                  })
                  .filter((value: null | number) => value !== null),
              );
            }
          } catch (e) {
            console.log(e);
          }

          setDeleteFolderCheckModalOpen(false);
        }}
      />

      <DeleteCheckModal
        deleteCheckModalOpen={deleteVideoCheckModalOpen}
        setDeleteCheckModalOpen={setDeleteVideoCheckModalOpen}
        handleDelete={async () => {
          if (directoryError !== '') {
            alert('뒤로 가기를 눌러주세요');
            return;
          }
          try {
            let deletedDirectory = checkedDirectoryArr.map(
              (value) => sortedDirectoryDatas[value].fileName,
            );

            for (let i = 0; i < checkedDirectoryArr.length; i += 1) {
              if (sortedDirectoryDatas[checkedDirectoryArr[i]].isDir === false) {
                const deletedPath = sortedDirectoryDatas[checkedDirectoryArr[i]].path;
                await deleteVideo(deletedPath);

                deletedDirectory = deletedDirectory.filter(
                  (value) =>
                    sortedDirectoryDatas[checkedDirectoryArr[i]].fileName !== value,
                );
              }
            }
            console.log(deletedDirectory);
            const absolutePath = breadscrumArray.join('/');
            if (absolutePath !== '/') {
              const { data } = await getDirectory(absolutePath.slice(1));
              console.log(data);
              setDirectoryDatas(data);
              setCheckedDirectoryArr(
                data
                  .map((directory: DirectoryType, index: number) => {
                    if (deletedDirectory.indexOf(directory.fileName) !== -1)
                      return index;
                    return null;
                  })
                  .filter((value: null | number) => value !== null),
              );
            } else {
              const { data } = await getDirectory(absolutePath);

              setDirectoryDatas(data);
              setCheckedDirectoryArr(
                data
                  .map((directory: DirectoryType, index: number) => {
                    if (deletedDirectory.indexOf(directory.fileName) !== -1)
                      return index;
                    return null;
                  })
                  .filter((value: null | number) => value !== null),
              );
            }
          } catch (e: unknown) {
            const err = e as { response?: { data?: { errorDescription?: string; details?: string } } };
            const msg =
              err?.response?.data?.details ??
              err?.response?.data?.errorDescription ??
              '삭제 중 오류가 발생했습니다.';
            setErrorMessage(msg);
            setErrorModalOpen(true);
            setDeleteVideoCheckModalOpen(false);
            return;
          }
          setDeleteVideoCheckModalOpen(false);
        }}
      />
      <CreateFolderModal
        modalOpen={isFolderCreateModalOpen}
        setModalOpen={setIsFolderCreateModalOpen}
        breadscrumArray={breadscrumArray}
        setDirectoryDatas={setDirectoryDatas}
      />
      <VideoUploadingModal
        modalOpen={isVideoUploadingModalOpen}
        uploadingInfoList={uploadingInfoList}
      />
      <ErrorConfirmModal
        errorModalOpen={errorModalOpen}
        setErrorModalOpen={setErrorModalOpen}
        errorMessage={errorMessage}
      />
      <div className="px-24">
        <div className="mt-8 flex items-center text-black">
          {breadscrumArray.map((breadscrumData, breadscrumIndex) => {
            if (breadscrumIndex === breadscrumArray.length - 1) {
              return (
                <div key={breadscrumData}>
                  <span className="text-lg font-bold">{breadscrumData}</span>
                </div>
              );
            }
            return (
              <div key={breadscrumData} className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    let tempBreadscrum = '';
                    for (let i = 0; i < breadscrumArray.length; i += 1) {
                      if (i === 0) {
                        tempBreadscrum += breadscrumArray[i];
                      } else {
                        tempBreadscrum += `_${breadscrumArray[i]}`;
                      }
                      if (breadscrumArray[i] === breadscrumData) {
                        searchParams.set('breadscrum', tempBreadscrum);
                        setSearchParams(searchParams);
                        setCheckedDirectoryArr([]);
                        break;
                      }
                    }
                  }}
                >
                  <span className="text-lg mr-1">{breadscrumData}</span>
                </button>
                <AiOutlineRight size="1.5rem" className="mr-1" color="gray" />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <TextButton
              color="gray"
              moreStyle="w-[9rem] mr-4"
              handleClick={() => {
                if (directoryError !== '') {
                  alert('뒤로 가기를 눌러주세요');
                  return;
                }
                setIsFolderCreateModalOpen(true);
              }}
            >
              폴더 생성
            </TextButton>
            <TextButton
              color="gray"
              moreStyle="w-[9rem]  mr-4"
              handleClick={async () => {
                setDeleteFolderCheckModalOpen(true);
              }}
            >
              폴더 삭제
            </TextButton>
            <label htmlFor="vedioUpload">
              <TextButton
                color="gray"
                moreStyle="w-[9rem] mr-4"
                handleClick={() => {
                  if (directoryError !== '') {
                    alert('뒤로 가기를 눌러주세요');
                    return;
                  }
                  if (videoRef.current === null) return;
                  videoRef.current.click();
                }}
              >
                영상 업로드
              </TextButton>
              <input
                id="vedioUpload"
                ref={videoRef}
                type="file"
                accept="video/mp4"
                capture="environment"
                multiple
                className="hidden"
                onChange={handleEnrollVideo}
              />
            </label>

            <TextButton
              color="gray"
              moreStyle="w-[9rem]"
              handleClick={async () => {
                setDeleteVideoCheckModalOpen(true);
              }}
            >
              영상 삭제
            </TextButton>
          </div>

          <div className="mr-24 flex">
            <button
              type="button"
              aria-label="줄 레이아웃"
              className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200  active:bg-gray-300 transition mr-4 ${uiStatus === 'line' ? 'ring-blue-500 ring-2 outline-none' : ''}`}
              onClick={() => {
                setUiStatus('line');
              }}
            >
              <CgLayoutList className="text-2xl text-gray-700" />
            </button>
            <button
              type="button"
              aria-label="그리드 레이아웃"
              className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200  active:bg-gray-300 transition mr-4 ${uiStatus === 'grid' ? 'ring-blue-500 ring-2 outline-none' : ''}`}
              onClick={() => {
                setUiStatus('grid');
              }}
            >
              <CgLayoutGrid className="text-2xl text-gray-700" />
            </button>
          </div>
        </div>
      </div>
      <hr className="w-[1300px] h-[1.3px] mx-auto bg-hpGray mt-3" />
      {uiStatus === 'line' ? (
        <div className="pl-24 h-[800px] overflow-y-auto">
          {directoryError === '' ? (
            <div className="flex justify-start">
              <div className="mt-6 mr-2">
                <hr />
                <div className="w-[1000px] flex justify-between py-2">
                  <div className="ml-8 flex items-center">
                    <span className="text-md">종류</span>
                    <button
                      type="button"
                      className="ml-6 text-md flex items-center gap-1 hover:text-hpBlue"
                      onClick={() => handleSort('name')}
                    >
                      이름
                      {sortConfig.key === 'name' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="mr-6 text-md flex items-center gap-1 hover:text-hpBlue"
                    onClick={() => handleSort('date')}
                  >
                    생성 날짜
                    {sortConfig.key === 'date' && (
                      <span className="text-xs">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </button>
                </div>
                <hr />

                {sortedDirectoryDatas.map((data, index) => {
                  if (data.isDir === true) {
                    return (
                      <Folder
                        key={data.createdTime + data.fileName}
                        name={data.fileName}
                        createTime={data.createdTime}
                        setCheckedDirectoryArr={setCheckedDirectoryArr}
                        index={index}
                        layout={uiStatus}
                      />
                    );
                  }
                  return (
                    <VideoFile
                      key={data.createdTime + data.fileName}
                      name={data.fileName}
                      createTime={data.createdTime}
                      setCheckedDirectoryArr={setCheckedDirectoryArr}
                      index={index}
                      layout={uiStatus}
                    />
                  );
                })}
              </div>
              <div className="w-[300px] min-h-[530px] border-hpGray border-l-[1.3px] border-solid relative">
                {checkedDirectoryArr.length === 0 && (
                  <div>선택 된 파일 및 폴더가 없습니다</div>
                )}
                {checkedDirectoryArr.length !== 0 &&
                  directoryDatas[
                    checkedDirectoryArr[checkedDirectoryArr.length - 1]
                  ].isDir === true && (
                    <FolderDetailTab
                      folderData={
                        directoryDatas[
                          checkedDirectoryArr[checkedDirectoryArr.length - 1]
                        ]
                      }
                      breadscrumArray={breadscrumArray}
                      setDirectoryDatas={setDirectoryDatas}
                    />
                  )}
                {checkedDirectoryArr.length !== 0 &&
                  directoryDatas[
                    checkedDirectoryArr[checkedDirectoryArr.length - 1]
                  ].isDir === false && (
                    <FileDetailTab
                      fileData={
                        directoryDatas[
                          checkedDirectoryArr[checkedDirectoryArr.length - 1]
                        ]
                      }
                    />
                  )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[540px] ">
              <div className="bg-gray-100 p-8 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-4">
                  권한 없음
                </h2>
                <p className="text-gray-700 mb-6">
                  해당 디렉토리에 접근할 수 있는 권한이 없습니다.
                </p>
                <div className="flex justify-center space-x-4">
                  {/* 뒤로가기 버튼 */}
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    뒤로가기
                  </button>

                  {/* 디렉토리 이동 버튼 */}
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    디렉토리 이동
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="pl-24 h-[800px] overflow-y-auto">
          {directoryError === '' ? (
            <div className="flex justify-end px-4">
              <div className="grow grid grid-cols-4 gap-y-1 gap-x-0 mt-6">
                {sortedDirectoryDatas.map((data, index) => {
                  if (data.isDir === true) {
                    return (
                      <Folder
                        key={data.createdTime + data.fileName}
                        name={data.fileName}
                        createTime={data.createdTime}
                        setCheckedDirectoryArr={setCheckedDirectoryArr}
                        index={index}
                        layout="grid"
                      />
                    );
                  }
                  return (
                    <VideoFile
                      key={data.createdTime + data.fileName}
                      name={data.fileName}
                      createTime={data.createdTime}
                      setCheckedDirectoryArr={setCheckedDirectoryArr}
                      index={index}
                      layout="grid"
                    />
                  );
                })}
              </div>
              <div className="w-[300px] min-h-[530px] border-hpGray border-l-[1.3px] border-solid relative">
                {checkedDirectoryArr.length === 0 && (
                  <div>선택 된 파일 및 폴더가 없습니다</div>
                )}
                {checkedDirectoryArr.length !== 0 &&
                  directoryDatas[
                    checkedDirectoryArr[checkedDirectoryArr.length - 1]
                  ].isDir === true && (
                    <FolderDetailTab
                      folderData={
                        directoryDatas[
                          checkedDirectoryArr[checkedDirectoryArr.length - 1]
                        ]
                      }
                      breadscrumArray={breadscrumArray}
                      setDirectoryDatas={setDirectoryDatas}
                    />
                  )}
                {checkedDirectoryArr.length !== 0 &&
                  directoryDatas[
                    checkedDirectoryArr[checkedDirectoryArr.length - 1]
                  ].isDir === false && (
                    <FileDetailTab
                      fileData={
                        directoryDatas[
                          checkedDirectoryArr[checkedDirectoryArr.length - 1]
                        ]
                      }
                    />
                  )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[540px] ">
              <div className="bg-gray-100 p-8 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-4">
                  권한 없음
                </h2>
                <p className="text-gray-700 mb-6">
                  해당 디렉토리에 접근할 수 있는 권한이 없습니다.
                </p>
                <div className="flex justify-center space-x-4">
                  {/* 뒤로가기 버튼 */}
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    뒤로가기
                  </button>

                  {/* 디렉토리 이동 버튼 */}
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    디렉토리 이동
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VedioManagementPage;
