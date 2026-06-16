import TextButton from '../atoms/TextButton';

interface SlideBarProps {
  num: number;
  firstText: string;
  secondText: string;
  thirdText?: string;
  fourthText?: string;
  isClickArr: boolean[];
  setIsClickArr: React.Dispatch<React.SetStateAction<boolean[]>>;
  isStudent?: boolean;
  type?: string;
}

function SlideBar({
  num,
  firstText,
  secondText,
  thirdText = '',
  fourthText = '',
  isClickArr,
  setIsClickArr,
  isStudent,
  type = '',
}: SlideBarProps) {
  if (num === 4) {
    const barLeft = isClickArr[3]
      ? 'left-[625px]'
      : isClickArr[2]
        ? 'left-[425px]'
        : isClickArr[1]
          ? 'left-[230px]'
          : 'left-[35px]';

    return (
      <div className="w-[836px]">
        <div>
          <TextButton
            color="white"
            isClick={isClickArr[0]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([true, false, false, false])}
          >
            {firstText}
          </TextButton>
          <TextButton
            color="white"
            isClick={isClickArr[1]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([false, true, false, false])}
          >
            {secondText}
          </TextButton>
          <TextButton
            color="white"
            isClick={isClickArr[2]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([false, false, true, false])}
          >
            {thirdText}
          </TextButton>
          <TextButton
            color="white"
            isClick={isClickArr[3]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([false, false, false, true])}
          >
            {fourthText}
          </TextButton>
        </div>
        <div
          className={`transition-[left] relative h-1 w-40 mt-1 bg-hpBlue ${barLeft}`}
        />
      </div>
    );
  }

  if (type === 'course') {
    const barLeft = isClickArr[2]
      ? 'left-[290px]'
      : isClickArr[1]
        ? 'left-[150px]'
        : 'left-[10px]';

    return (
      <div>
        <div>
          <TextButton
            color="white"
            isClick={isClickArr[0]}
            moreStyle="w-[120px] mr-4"
            handleClick={() =>
              setIsClickArr(thirdText ? [true, false, false] : [true, false])
            }
          >
            {firstText}
          </TextButton>
          <TextButton
            color="white"
            isClick={isClickArr[1]}
            moreStyle="w-[120px] mr-4"
            handleClick={() =>
              setIsClickArr(thirdText ? [false, true, false] : [false, true])
            }
          >
            {secondText}
          </TextButton>
          {thirdText && (
            <TextButton
              color="white"
              isClick={isClickArr[2]}
              moreStyle="w-[120px] mr-4"
              handleClick={() => setIsClickArr([false, false, true])}
            >
              {thirdText}
            </TextButton>
          )}
        </div>
        <div
          className={`transition-[left] relative h-1 w-24 mt-1 bg-hpBlue ${barLeft}`}
        />
      </div>
    );
  }

  if (num === 2) {
    if (isStudent) {
      return (
        <div>
          <div>
            <div>
              <TextButton
                color="white"
                moreStyle={`w-[120px] mb-2 mr-1 transition-transform transform hover:scale-105 duration-300 ${
                  isClickArr[0] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                }`}
                isClick={isClickArr[0]}
                handleClick={() => setIsClickArr([true, false])}
                textMoreStyle="leading-[16px] text-md"
              >
                {firstText}
              </TextButton>
            </div>
            <TextButton
              color="white"
              moreStyle={`w-[120px] transition-transform transform hover:scale-105 duration-300 ${
                isClickArr[1] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
              }`}
              isClick={isClickArr[1]}
              handleClick={() => setIsClickArr([false, true])}
              textMoreStyle="leading-[16px] text-md"
            >
              {secondText}
            </TextButton>
          </div>
        </div>
      );
    }

    const barLeft = isClickArr[0] ? 'left-[20px]' : 'left-[215px]';

    return (
      <div>
        <div>
          <TextButton
            color="white"
            isClick={isClickArr[0]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([true, false])}
          >
            {firstText}
          </TextButton>
          <TextButton
            color="white"
            isClick={isClickArr[1]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([false, true])}
          >
            {secondText}
          </TextButton>
        </div>
        <div
          className={`transition-[left] relative h-1 w-36 mt-1 bg-hpBlue ${barLeft}`}
        />
      </div>
    );
  }

  if (num === 3) {
    const barLeft = isClickArr[2]
      ? 'left-[400px]'
      : isClickArr[1]
        ? 'left-[205px]'
        : 'left-[10px]';

    return (
      <div>
        <div>
          <TextButton
            color="white"
            isClick={isClickArr[0]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([true, false, false])}
          >
            {firstText}
          </TextButton>
          <TextButton
            color="white"
            isClick={isClickArr[1]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([false, true, false])}
          >
            {secondText}
          </TextButton>
          <TextButton
            color="white"
            isClick={isClickArr[2]}
            moreStyle="w-[180px] mr-4"
            handleClick={() => setIsClickArr([false, false, true])}
          >
            {thirdText}
          </TextButton>
        </div>
        <div
          className={`transition-[left] relative h-1 w-40 mt-1 bg-hpBlue ${barLeft}`}
        />
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <TextButton
            color="white"
            moreStyle={`w-[120px] mb-2 mr-1 transition-transform transform hover:scale-105 duration-300 ${
              isClickArr[0] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
            }`}
            isClick={isClickArr[0]}
            handleClick={() => setIsClickArr([true, false])}
            textMoreStyle="leading-[16px] text-md"
          >
            {firstText}
          </TextButton>
        </div>
        <TextButton
          color="white"
          moreStyle={`w-[120px] transition-transform transform hover:scale-105 duration-300 ${
            isClickArr[1] ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
          }`}
          isClick={isClickArr[1]}
          handleClick={() => setIsClickArr([false, true])}
          textMoreStyle="leading-[16px] text-md"
        >
          {secondText}
        </TextButton>
      </div>
    </div>
  );
}

export default SlideBar;
