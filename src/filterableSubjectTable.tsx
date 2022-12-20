import React, { useState } from 'react';
import './subjectTable.css';
import SubjectTable from './subjectTable'
import { courseJsonItem } from './courseTyping';

type FilterState = {
    campus: {
        seoul: boolean,
        anseong: boolean
    },
    query: {
        college: string,
        department: string,
        subjectCollege: string,
        subjectDepartment: string,
        schoolYear: {
            [1]: boolean,
            [2]: boolean,
            [3]: boolean,
            [4]: boolean,
            [5]: boolean,
            [6]: boolean,
        },
        classification: string,
        code: number | null,
        name: string,
        professor: string,
        points: number | null
    }
}

function FilterableSubjectTable(opts: { courses: courseJsonItem[], onAddButtonClick: (course: courseJsonItem) => void, courseCodesToHideAddBtn: number[] }) {
    const [ filters, setFilters ] = useState<FilterState>({
        campus: {
            seoul: true,
            anseong: true
        },
        query: {
            college: '',
            department: '',
            subjectCollege: '',
            subjectDepartment: '',
            schoolYear: {
                1: true,
                2: true,
                3: true,
                4: true,
                5: true,
                6: true
            },
            classification: '',
            code: null,
            name: '',
            professor: '',
            points: null
        }
    });

    const toggleCampusQuery = (isSeoul: boolean) => (() => {
        setFilters({
            ...filters,
            campus: {
                seoul: isSeoul ? !filters.campus.seoul : filters.campus.seoul,
                anseong: isSeoul ? filters.campus.anseong : !filters.campus.anseong
            }
        });
    });

    const setQueryValue = (name: keyof FilterState['query'], isNumber = false) => {
        return (evt: React.ChangeEvent<HTMLInputElement>) => {
            setFilters({
                ...filters,
                query: {
                    ...filters.query,
                    [name]: isNumber ? (isNaN(evt.target.valueAsNumber) ? null : evt.target.valueAsNumber) : evt.target.value
                }
            });
        }
    }

    const toggleSchoolYear = (schoolYear: 1|2|3|4|5|6) => {
        return () => {
            setFilters({
                ...filters,
                query: {
                    ...filters.query,
                    schoolYear: {
                        ...filters.query.schoolYear,
                        [schoolYear]: !filters.query.schoolYear[schoolYear]
                    }
                }
            })
        }
    }

    const courseFilterFunc = (subject: courseJsonItem) => {
        if (!filters.campus.seoul && subject.campus === '서울')
            return false;
        else if (!filters.campus.anseong && subject.campus === '안성')
            return false;
        
        const {query} = filters;
        if (query.classification.trim() !== '' && !subject.subject.classification.includes(query.classification.trim()))
            return false;
        if (query.code !== null && subject.subject.code !== query.code)
            return false;
        if (query.college.trim() !== '' && subject.college.name !== null && !subject.college.name.includes(query.college.trim()))
            return false;
        if (query.department.trim() !== '' && !subject.department.name?.includes(query.department.trim()))
            return false;
        if (query.name.trim() !== '' && !subject.subject.name.includes(query.name.trim()))
            return false;
        if (query.points !== null && subject.subject.points !== query.points)
            return false;
        if (query.professor.trim() !== '' && (subject.subject.professor === null || !subject.subject.professor.includes(query.professor.trim())))
            return false;
        if (query.subjectCollege.trim() !== '' && (subject.subject.collegeName === null || !subject.subject.collegeName.includes(query.subjectCollege.trim())))
            return false;
        if (query.subjectDepartment.trim() !== '' && (subject.subject.departmentName === null || !subject.subject.departmentName.includes(query.subjectDepartment.trim())))
            return false;
        if (!(query.schoolYear[1] && query.schoolYear[2] && query.schoolYear[3] && query.schoolYear[4])) {
            if (subject.subject.schoolYear === '전체')
                return false;
            for (let i = 1; i <= 6; i++) {
                if (!query.schoolYear[i as 1|2|3|4|5|6] && subject.subject.schoolYear === i.toString())
                    return false;
            }
        }

        return true;
    }

    return (
        <div>
        <div className="filterOptions" style={{background: 'whitesmoke', padding: '10px', marginBottom: '20px'}}>
                캠퍼스
                <label><input type="checkbox" name="campus" checked={filters.campus.seoul} onChange={toggleCampusQuery(true)}></input> 서울</label>
                <label><input type="checkbox" name="campus" checked={filters.campus.anseong} onChange={toggleCampusQuery(false)}></input> 안성<br></br></label>
                검색어
                <input type="name" placeholder='단과대' value={filters.query.college} onChange={setQueryValue('college')}></input>
                <input type="name" placeholder='학과/학부' value={filters.query.department} onChange={setQueryValue('department')}></input>
                <input type="name" placeholder='개설대학' value={filters.query.subjectCollege} onChange={setQueryValue('subjectCollege')}></input>
                <input type="name" placeholder='개설학부' value={filters.query.subjectDepartment} onChange={setQueryValue('subjectDepartment')}></input>
                <input type="name" placeholder='이수구분' value={filters.query.classification} onChange={setQueryValue('classification')}></input>
                <input type="number" placeholder='과목번호' value={filters.query.code ?? undefined} onChange={setQueryValue('code', true)}></input>
                <input type="name" placeholder='과목명' value={filters.query.name} onChange={setQueryValue('name')}></input>
                <input type="name" placeholder='교수' value={filters.query.professor} onChange={setQueryValue('professor')}></input>
                <input type="number" placeholder='학점' value={filters.query.points ?? undefined} onChange={setQueryValue('points', true)}></input>
                <br></br>
                학년
                <label><input name="schoolYear" type="checkbox" checked={filters.query.schoolYear[1]} onChange={toggleSchoolYear(1)}></input>1학년</label>
                <label><input name="schoolYear" type="checkbox" checked={filters.query.schoolYear[2]} onChange={toggleSchoolYear(2)}></input>2학년</label>
                <label><input name="schoolYear" type="checkbox" checked={filters.query.schoolYear[3]} onChange={toggleSchoolYear(3)}></input>3학년</label>
                <label><input name="schoolYear" type="checkbox" checked={filters.query.schoolYear[4]} onChange={toggleSchoolYear(4)}></input>4학년</label>
                <label><input name="schoolYear" type="checkbox" checked={filters.query.schoolYear[5]} onChange={toggleSchoolYear(5)}></input>5학년</label>
                <label><input name="schoolYear" type="checkbox" checked={filters.query.schoolYear[6]} onChange={toggleSchoolYear(6)}></input>6학년</label>
                
        </div>
        <SubjectTable courses={opts.courses.filter(courseFilterFunc)} onAddButtonClick={opts.onAddButtonClick} courseCodesToHideAddBtn={opts.courseCodesToHideAddBtn}></SubjectTable>
        </div>
    );
}

export default FilterableSubjectTable;
