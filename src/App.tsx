import { useState, useRef } from 'react';
import Timetable from './Timetable';
import './App.css';
import FilterableSubjectTable from './filterableSubjectTable';
import { parseSubjectSchedule, CauSubjectSchedule } from "cau.ac.kr";
import { CourseJsonDataItem, CrawlInfo } from './courseTyping';
import Qna from './qna';
import Popup from './Popup';
import WarningSection from './warningSection';
import { Canvg, presets } from 'canvg';

type timetableCourse = { course: CourseJsonDataItem, code: number, class: number, schedules: CauSubjectSchedule[] };

function App() {
  const [isSearchCoursePopupActive, setSearchCoursePopupActive] = useState<boolean>(false);
  const [isCurrentAddedCoursesPopupActive, setCurrentAddedCoursesPopupActive] = useState<boolean>(false);
  const [courses, setCourses] = useState<(CourseJsonDataItem[])>([]);
  const [crawlInfo, setCrawlInfo] = useState<CrawlInfo | null>(null);
  const [addedClasses, _setAddedClasses] = useState<(timetableCourse)[]>(JSON.parse(localStorage.getItem('cau-pre-timetable-added-classes') ?? '[]'));
  const timetableSVGRef = useRef<SVGSVGElement>(null);

  const setAddedClasses = (v: timetableCourse[]) => {
    localStorage.setItem('cau-pre-timetable-added-classes', JSON.stringify(v));
    _setAddedClasses(v);
  }

  const addSchedule = (course: CourseJsonDataItem) => {
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

    const result: timetableCourse = {
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

  const deleteScheduleByCode = (code: number) => {
    setAddedClasses(addedClasses.filter(i => i.code !== code));
  }
  const exportAsImage = async () => {
    const svg = timetableSVGRef.current?.outerHTML
    if (svg === null || typeof svg === 'undefined')
      return alert('오류! null/undefined svg');
    
    const canvas = new OffscreenCanvas(560, 950);
    const ctx = canvas.getContext('2d')

    if (ctx == null)
      return alert('오류! null canvas context');

    const v = await Canvg.from(ctx, svg, presets.offscreen());
    await v.render();

    const pngBlob = await canvas.convertToBlob({type: 'image/png'})
    const pngBlobUrl = window.URL.createObjectURL(pngBlob)
    
    const anchor = document.createElement('a');
    anchor.download = 'timetable.png';
    anchor.href = pngBlobUrl
    anchor.click()
  }

  return (
    <div className="app">
      <header>
        <h1>강의시간표 미리보기 ({crawlInfo?.year}년 {crawlInfo?.semester}학기)</h1>
      </header>
      <article>
        <WarningSection></WarningSection>
        <section>
          <div className="timetable">
            <Timetable
              ref={timetableSVGRef}
              classes={
                addedClasses.map(i => ({
                  name: i.course.subject.name,
                  professor: i.course.subject.professor || '',
                  schedules: i.schedules
                }))}
            ></Timetable>
          </div>
        </section>
        <div className="actionButtons">
          <button type="button" disabled={isCurrentAddedCoursesPopupActive || isSearchCoursePopupActive} onClick={() => { setSearchCoursePopupActive(true); }}>강의 검색</button>&nbsp;
          <button type="button" disabled={isCurrentAddedCoursesPopupActive || isSearchCoursePopupActive} onClick={() => { setCurrentAddedCoursesPopupActive(true); }}>현재 추가된 강의 목록</button>&nbsp;
          <button type="button" onClick={() => { setAddedClasses([]); }}>시간표 비우기</button>&nbsp;
          <button type="button" onClick={() => { exportAsImage() }}>이미지로 저장</button>
        </div>
        <section className="qnaContainer">
          <h1>Q&A</h1>
          <Qna crawlInfo={crawlInfo}></Qna>
        </section>
        <Popup active={isSearchCoursePopupActive} onCloseButtonClick={() => { setSearchCoursePopupActive(false); }} title='강의 검색'>
          <div>
            <FilterableSubjectTable
              courses={(courses as any[]).filter(i => i.subject.courseName === '학사')}
              onAddButtonClick={(i) => { addSchedule(i); }}
              onDeleteButtonClick={(i) => {deleteScheduleByCode(i.subject.code);}}
              courseCodesToHideAddBtn={addedClasses.map(i => i.code)}
            ></FilterableSubjectTable>
          </div>
        </Popup>
        <Popup active={isCurrentAddedCoursesPopupActive} onCloseButtonClick={() => { setCurrentAddedCoursesPopupActive(false); }} title='현재 시간표에 추가된 강의들'>
          <div className="timetablePreview">
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
                    <td><button type="button" onClick={() => deleteScheduleByCode(i.code)}>삭제</button></td>
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
          </div>
        </Popup>
      </article>
      <footer>
        Written by. <a href="https://yeonjin.name">Yeonjin Shin</a>
      </footer>
    </div>
  );
}

export default App;
