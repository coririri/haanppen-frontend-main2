import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import WriteOfflineClassPage from './WriteOfflineClassPage';
import WriteOnlineClassPage from './WriteOnlineClassPage';
import WriteTestPaperClassPage from './WriteTestPaperClassPage';
import SlideBar from '../molecules/SlideBar';

function WriteClassPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classTypeArr, setClassArrType] = useState<boolean[]>(() => {
    if (searchParams.get('classType') === 'offline') return [true, false, false];
    if (searchParams.get('classType') === 'testpaper') return [false, false, true];
    return [false, true, false];
  });

  const handleTabChange = (newArr: boolean[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (newArr[0]) newParams.set('classType', 'offline');
    else if (newArr[2]) newParams.set('classType', 'testpaper');
    else newParams.set('classType', 'online');
    newParams.set('classIndex', '0');
    setSearchParams(newParams);
    setClassArrType(newArr);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-2">
      <SlideBar
        num={3}
        firstText="학원강좌"
        secondText="단과강좌"
        thirdText="문제집"
        isClickArr={classTypeArr}
        setIsClickArr={handleTabChange as React.Dispatch<React.SetStateAction<boolean[]>>}
      />
      <div className="mt-4">
        {classTypeArr[0] && (
          <WriteOfflineClassPage
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}
        {classTypeArr[1] && (
          <WriteOnlineClassPage
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}
        {classTypeArr[2] && (
          <WriteTestPaperClassPage
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}
      </div>
    </div>
  );
}

export default WriteClassPage;
