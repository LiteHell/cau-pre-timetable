import { useState } from 'react';
import Timetable from './Timetable';
import './App.css';
import FilterableSubjectTable from './filterableSubjectTable';
import { parseSubjectSchedule, CauSubjectSchedule } from "cau.ac.kr";
import { courseJsonItem } from './courseTyping';

type AddedClass = { course: courseJsonItem, code: number, class: number, schedules: CauSubjectSchedule[] };
type CrawlInfo = {
  crawlledAt: number,
  year: string,
  semester: string;
}

function App() {
  const [courses, setCourses] = useState<(courseJsonItem[])>([]);
  const [crawlInfo, setCrawlInfo] = useState<CrawlInfo | null>(null);
  const [addedClasses, setAddedClasses] = useState<(AddedClass)[]>([]);

  const addSchedule = (course: courseJsonItem) => {
    // Duplicate?
    if (addedClasses.some(i => i.code === course.subject.code)) {
      return alert('이미 해당 강의를 추가했습니다');
    }

    // Timeslot unavailble?
    const parsed = parseSubjectSchedule(course.subject.schedule);
    for (const i of parsed)
      for (const j of i.times) {
        const blockeds = addedClasses.filter(k => k.schedules.some(h =>
          !h.times.filter(u => u.day === j.day).every(u =>
            u.timeStartsAt < j.timeStartsAt ?
              (u.timeEndsAt <= j.timeStartsAt) :
              (j.timeEndsAt <= u.timeStartsAt))
        ));

        if (blockeds.length > 0) {
          return alert('다음 수업과 겹칩니다: ' + blockeds.map(i => i.course.subject.name).join(', '));
        }
      }

    const result: AddedClass = {
      code: course.subject.code,
      class: course.subject.class,
      course,
      schedules: parsed
    }
    setAddedClasses([
      ...addedClasses,
      result
    ]);
  };

  setTimeout(async () => {
    if (crawlInfo === null) {
      const coursesJson = await fetch('/courses/courses.json');
      setCourses(await coursesJson.json());
      const crawlInfo = await fetch('/courses/crawlInfo.json');
      setCrawlInfo(await crawlInfo.json());
    }
  }, 0);

  const deleteSchedule = (cls: AddedClass) => {
    setAddedClasses(addedClasses.filter(i => i.code !== cls.code || i.class !== cls.class));
  }

  return (
    <div className="App">
      <header>
        <h1>시간표 미리보기</h1>
        <p>Q. 이게 뭡니까?<br></br>
          A. 강의시간표 정식공개 전에 부정확하게나마 확인할 수 있게 하는 웹사이트입니다.<br></br>
          시간표도 나름 만들어볼 수 있게 밑에 시간표 만드는 기능도 넣어놨습니다. (버그 있을 수 있음)<br></br><br></br>
          Q. 정확합니까?<br></br>
          A. 정식 공개일 전에 크롤링한 거니 어느정도 부정확합니다.<br></br><br></br>
          Q. 파일로 다운로드받고 싶어요.<br></br>
          A. <a href="/courses/courses.json">JSON 파일 링크</a>, <a href="/courses/courses.csv">CSV 파일 링크</a><br></br>
          &nbsp;&nbsp;&nbsp;CSV 파일 다운받아서 엑셀로 여시면 편리합니다. <a href="https://blog.naver.com/excelmc/220843369039">추가적으로, 엑셀 자동필터 기능 쓰시면 더 편리합니다.</a><br></br><br></br>
          Q. 홈페이지 UI가 성의없습니다.<br></br>
          A. 대충 만들어서 그렇습니다. 그냥 쓰세요.<br></br><br></br>
          Q. 언제 크롤링된 데이터입니까?<br></br>
          A. {crawlInfo === null ? '지금 불러오는 중이니 잠시만 기다려주세요.' : `${new Date(crawlInfo.crawlledAt).toLocaleString()}에 크롤링된 ${crawlInfo.year}년도 ${crawlInfo.semester}학기 데이터입니다.`}<br></br><br></br>
          ※ 학사과정 과목들만 표시됩니다. 대학원 과목들도 표시할 수 있긴 한데 귀찮음.</p>
      </header>
      <article>
        <div className="search">
          <FilterableSubjectTable
            courses={(courses as any[]).filter(i => i.subject.courseName === '학사')}
            onAddButtonClick={(i) => { addSchedule(i); }}
            courseCodesToHideAddBtn={addedClasses.map(i => i.code)}
          ></FilterableSubjectTable>
        </div>
        <div className="timetable-preview">
          <div>
            <table className="classesAdded">
              <thead>
                <tr>
                  <th>삭제</th>
                  <th>이수구분</th>
                  <th>학년</th>
                  <th>학점</th>
                  <th>과목번호 - 분반</th>
                  <th>과목명</th>
                  <th>교수</th>
                  <th>시간 및 장소</th>
                </tr>
              </thead>
              <tbody>
                {addedClasses.map(i => <tr>
                  <td><button type="button" onClick={() => deleteSchedule(i)}>삭제</button></td>
                  <td>{i.course.subject.classification}</td>
                  <td>{i.course.subject.schoolYear}</td>
                  <td>{i.course.subject.points}</td>
                  <td>{i.course.subject.code} - {i.course.subject.class}</td>
                  <td>{i.course.subject.name}</td>
                  <td>{i.course.subject.professor}</td>
                  <td>{i.course.subject.schedule}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="timetable">
            <Timetable
              classes={
                addedClasses.map(i => ({
                  name: i.course.subject.name,
                  professor: i.course.subject.professor || '',
                  schedules: i.schedules
                }))}
            ></Timetable>
          </div>
        </div>
      </article>
    </div>
  );
}

export default App;
