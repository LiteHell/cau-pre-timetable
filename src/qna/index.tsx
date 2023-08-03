import { CrawlInfo } from "../courseTyping";
import styles from './qna.module.css';

export default function qna({ crawlInfo }: { crawlInfo: CrawlInfo | null }) {
  return <p>
    <div className={styles.qnaItem}>
      <div className={styles.question}>이게 뭡니까?</div>
      <div className={styles.answer}>강의시간표 정식공개 전에 부정확하게나마 확인할 수 있게 하는 웹사이트입니다.<br></br>
        시간표도 나름 만들어볼 수 있게 위에 시간표 만드는 기능도 넣어놨습니다. (버그 있을 수 있음)</div>
    </div>
    <div className={styles.qnaItem}>
      <div className={styles.question}>정확합니까?</div>
      <div className={styles.answer}>정식 공개일 전에 크롤링한 거니 어느정도 부정확합니다.</div>
    </div>
    <div className={styles.qnaItem}>
      <div className={styles.question}>파일로 다운로드받고 싶어요.</div>
      <div className={styles.answer}>
        <a href="/courses/courses.json">JSON 파일 링크</a>, <a href="/courses/courses.csv">CSV 파일 링크</a><br></br>
        CSV 파일 다운받아서 엑셀로 여시면 편리합니다. <a href="https://blog.naver.com/excelmc/220843369039">추가적으로, 엑셀 자동필터 기능 쓰시면 더 편리합니다.</a>
      </div>
    </div>
    <div className={styles.qnaItem}>
      <div className={styles.question}>홈페이지 UI가 성의없습니다.</div>
      <div className={styles.answer}>대충 만들어서 그렇습니다. 그냥 쓰세요.</div>
    </div>
    <div className={styles.qnaItem}>
      <div className={styles.question}>언제 크롤링된 데이터입니까?</div>
      <div className={styles.answer}>{crawlInfo === null ? '지금 불러오는 중이니 잠시만 기다려주세요.' : `${new Date(crawlInfo.crawlledAt).toLocaleString()}에 크롤링된 ${crawlInfo.year}년도 ${crawlInfo.semester}학기 데이터입니다.`}</div>
    </div>
  </p>;
}