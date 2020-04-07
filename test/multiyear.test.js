
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1vZGVsbC5qZWZmQG1lLmNvbSIsImlhdCI6MTU4NjE3MTQwNCwiZXhwIjoxNTg3NDY3NDA0fQ.vfSZm7Y4mYPBMFeiXuFHvKPuvy71sx3jIjnlB4dUWgo"
var ff = "2"
var ohf = "2"

const DATE_HELPER = (date) => {
    let [ year, month, day ] = date.split("-")
    year = parseInt(year)
    month = parseInt(month) - 1
    day = parseInt(day)

    // console.log(year, month, day)
    // console.log(new Date(year, month, day, 0, 0, 0, 0))

    return new Date(year, month, day, 0, 0, 0, 0)
}

const API_TEST = async (date, item, ff, ohf, token) => {
    let periods = {}    

    periods.FIRST_END = new Date(DATE_HELPER(date)) // "2019-12-31"
    periods.FIRST_START = new Date(periods.FIRST_END.getFullYear() - 1, periods.FIRST_END.getMonth(), periods.FIRST_END.getDate() + 1) // "2019-01-01"

    periods.SECOND_END = new Date(periods.FIRST_END.getFullYear() - 1, periods.FIRST_END.getMonth(), periods.FIRST_END.getDate()) // "2018-12-31"
    periods.SECOND_START = new Date(periods.FIRST_END.getFullYear() - 2, periods.FIRST_END.getMonth(), periods.FIRST_END.getDate() + 1) // "2018-01-01"
    
    periods.THIRD_END = new Date(periods.FIRST_END.getFullYear() - 2, periods.FIRST_END.getMonth(), periods.FIRST_END.getDate()) // "2017-12-31"
    periods.THIRD_START = new Date(periods.FIRST_END.getFullYear() - 3, periods.FIRST_END.getMonth(), periods.FIRST_END.getDate() + 1) // "2017-01-01"

    const variables = [
        { start: periods.FIRST_START.toISOString().substring(0,10), end: periods.FIRST_END.toISOString().substring(0,10), item, ff, ohf },
        { start: periods.SECOND_START.toISOString().substring(0,10), end: periods.SECOND_END.toISOString().substring(0,10), item, ff, ohf },
        { start: periods.THIRD_START.toISOString().substring(0,10), end: periods.THIRD_END.toISOString().substring(0,10), item, ff, ohf },
       ]

    let responses = []
       
    for (let i=0;i<variables.length;i++) {
        let res = await fetch(`http://localhost:9090/api/sale/item?start=${variables[i].start}&end=${variables[i].end}&item=${variables[i].item}`,{
            method: "GET",
            headers: {Authorization: `Bearer ${token}`},
        })
        //.then(res => responses.push(res.json()))

        responses.push(res.json())
    }

    return responses
}


