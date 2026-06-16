import { useState } from 'react';
import { Link } from 'react-router-dom';
import { dateTimeToDateAndZeroTimes } from '../../utils/dateTimeToDate';

const linkCls = 'text-xl hover:text-hpDarkBlue hover:font-sjBold text-black font-bold';

function Navigation() {
  const [, setClickIndex] = useState(1);
  const role = localStorage.getItem('role');

  if (role === 'STUDENT') {
    return (
      <nav className="min-w-[1440px] mx-auto">
        <div className="h-[61px] flex justify-center items-center gap-10">
          <button type="button" onClick={() => setClickIndex(1)}>
            <Link to="/my-class?classIndex=0&sortIndex=0" className={linkCls}>
              내 강의실
            </Link>
          </button>
          <button type="button" onClick={() => setClickIndex(2)}>
            <Link to="/question-board" className={linkCls}>
              질문 게시판
            </Link>
          </button>
          <button type="button" onClick={() => setClickIndex(3)}>
            <Link to="/lesson-overview" className={linkCls}>
              개설 강좌
            </Link>
          </button>
        </div>
      </nav>
    );
  }

  if (role === 'ADMIN')
    return (
      <nav className="min-w-[1440px] mx-auto">
        <div className="h-[50px] flex justify-center items-center gap-10">
          <Link
            to={`/enroll-class?date=${new Date(dateTimeToDateAndZeroTimes(new Date()))}&classIndex=0&classType=offline`}
            className={linkCls}
            onClick={() => setClickIndex(1)}
          >
            강의 등록
          </Link>
          <Link
            to="/question-board"
            className={linkCls}
            onClick={() => setClickIndex(2)}
          >
            질문 게시판
          </Link>
          <Link
            to="/management"
            className={linkCls}
            onClick={() => setClickIndex(3)}
          >
            관리
          </Link>
          <Link
            to="/vedio-management?breadscrum=/&date=Wed%20Oct%2023%202024%2018:32:03%20GMT+0900%20(%ED%95%9C%EA%B5%AD%20%ED%91%9C%EC%A4%80%EC%8B%9C)"
            className={linkCls}
            onClick={() => setClickIndex(4)}
          >
            영상 관리
          </Link>
        </div>
      </nav>
    );

  return (
    <nav className="min-w-[1440px] mx-auto">
      <div className="h-[50px] flex justify-center items-center gap-10">
        <Link
          to={`/enroll-class?date=${new Date(dateTimeToDateAndZeroTimes(new Date()))}&classIndex=0&classType=offline`}
          className={linkCls}
          onClick={() => setClickIndex(1)}
        >
          강의 등록
        </Link>
        <Link
          to="/question-board"
          className={linkCls}
          onClick={() => setClickIndex(2)}
        >
          질문 게시판
        </Link>
        <Link
          to="/lesson-overview"
          className={linkCls}
          onClick={() => setClickIndex(3)}
        >
          개설 강좌
        </Link>
        <Link
          to="/management"
          className={linkCls}
          onClick={() => setClickIndex(4)}
        >
          관리
        </Link>
        <Link
          to="/vedio-management?breadscrum=/&date=Wed%20Oct%2023%202024%2018:32:03%20GMT+0900%20(%ED%95%9C%EA%B5%AD%20%ED%91%9C%EC%A4%80%EC%8B%9C)"
          className={linkCls}
          onClick={() => setClickIndex(5)}
        >
          영상 관리
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;
