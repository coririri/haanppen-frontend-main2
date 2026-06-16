import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTestPaperLectureByLectureId } from '../../apis/testPaperLecture';
import { TestPaperLectureType } from '../../types/testPaperLectureType';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

function TestPaperLessonPage() {
  const [searchParams] = useSearchParams();
  const lectureId = Number(searchParams.get('lectureId'));
  const questionIndex = Number(searchParams.get('questionIndex'));
  const lectureName = searchParams.get('lectureName') ?? '';
  const testPaperName = searchParams.get('testPaperName') ?? '';

  const [lecture, setLecture] = useState<TestPaperLectureType | null>(null);

  useEffect(() => {
    getTestPaperLectureByLectureId(lectureId)
      .then(({ data }) => setLecture(data))
      .catch((e) => console.log(e));
  }, [lectureId]);

  const video = lecture?.videos[questionIndex - 1];
  const videoSrc = video?.path
    ? `${backendUrl}/api/media/stream?resourceId=${video.path}`
    : '';

  return (
    <div>
      <div className="flex justify-center items-center my-6 bg-gradient-to-r from-gray-100 to-blue-50 py-3 px-6 rounded-lg shadow-md mx-24">
        <span className="font-extrabold text-xl text-indigo-700 tracking-wide">
          {testPaperName || lecture?.testPaperName}
        </span>
      </div>
      <div className="w-full h-[1.4px] bg-hpGray" />
      <div className="text-center mt-3">
        <span className="text-2xl font-bold text-gray-900">
          문항 {questionIndex}
        </span>
      </div>
      <div className="px-6 py-4 border-2 border-gray-700 text-center rounded-xl mx-4 mb-5 mt-1 text-lg bg-gradient-to-r from-blue-100 to-indigo-100 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <span className="font-bold text-gray-900 tracking-wide">
          {lectureName || lecture?.lectureName}
        </span>
      </div>
      {videoSrc ? (
        <div className="flex justify-center">
          <video
            src={videoSrc}
            width="360px"
            height="240px"
            muted
            playsInline
            controls
          />
        </div>
      ) : (
        lecture && (
          <p className="text-center text-gray-400 mt-4">영상이 없습니다.</p>
        )
      )}
    </div>
  );
}

export default TestPaperLessonPage;
