type courseJsonCollege = {
    code: string | null,
    name: string | null,
    campus: number
}

export type courseJsonItem = {
    campus: '서울' | '안성',
    subject: {
        collegeName: string | null,
        departmentName: string | null,
        schoolYear: string,
        courseName: string,
        classification: string,
        code: number,
        class: number,
        name: string,
        points: number,
        time: number,
        professor: string | null,
        closed: string | null,
        schedule: string,
        flexible: string | null,
        remarks: string | null,
        classType: string | null
    },
    department: {
        campus: string
        name: string | null,
        code: string | null,
        college: courseJsonCollege
    },
    college: courseJsonCollege
};