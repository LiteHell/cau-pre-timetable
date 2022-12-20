import React from 'react';
import styles from './subjectTable.module.css';
import { PaginatedList } from 'react-paginated-list'
import { CourseJsonDataItem } from '../courseTyping';

function SubjectTable(opts: { courses: CourseJsonDataItem[], onAddButtonClick: (course: CourseJsonDataItem) => void, courseCodesToHideAddBtn: number[] }) {
    return (
        <PaginatedList
            list={opts.courses}
            itemsPerPage={20}
            renderList={(list) => (
                <table className={styles.subjects}>
                    <thead>
                        <th>추가</th>
                        <th>캠퍼스</th>
                        <th>단과대</th>
                        <th>학과/학부</th>
                        <th>개설대학</th>
                        <th>개설학부</th>
                        <th>학년</th>
                        <th>이수구분</th>
                        <th>과목번호 - 분반</th>
                        <th>과목명</th>
                        <th>교수</th>
                        <th>학점</th>
                        <th>폐강</th>
                        <th>유연학기</th>
                        <th>시간 및 장소</th>
                        <th>비고</th>
                        <th>강의유형</th>
                    </thead>
                    <tbody>
                        {list.map(i => <tr>
                            <td><button type="button" onClick={() => opts.onAddButtonClick(i)} disabled={opts.courseCodesToHideAddBtn.includes(i.subject.code)}>추가</button></td>
                            <td>{i.campus}</td>
                            <td>{i.college.name}</td>
                            <td>{i.department.name}</td>
                            <td>{i.subject.collegeName}</td>
                            <td>{i.subject.departmentName}</td>
                            <td>{i.subject.schoolYear}</td>
                            <td>{i.subject.classification}</td>
                            <td>{i.subject.code} - {i.subject.class}</td>
                            <td>{i.subject.name}</td>
                            <td>{i.subject.professor}</td>
                            <td>{i.subject.points}</td>
                            <td>{i.subject.closed}</td>
                            <td>{i.subject.flexible}</td>
                            <td>{i.subject.schedule}</td>
                            <td>{i.subject.remarks}</td>
                            <td>{i.subject.classType}</td>
                        </tr>)
                        }</tbody>
                </table>
            )}
        ></PaginatedList>
    );
}

export default SubjectTable;
