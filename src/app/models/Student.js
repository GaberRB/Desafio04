const db = require ('../../config/db')
const { age, date, grade } = require('../../lib/utils')
const Intl = require('intl')

module.exports = {
    all(callback){
        db.query(`
            SELECT *
            FROM students
            ORDER BY name ASC
        `, function(err, results){
            if(err) throw `Database error! ${err} `
            
            callback(results.rows)
        })

    },
    create(data, callback){
        const query = ` 
            INSERT INTO students(
                name,
                avatar_url,
                birth_date,
                education_level,
                email,
                hours,
                teacher_id
            )  VALUES (
                $1, $2, $3, $4, $5, $6, $7
            ) RETURNING id
        `

        const values = [
            data.name,
            data.avatar_url,
            date(data.birth_date).iso,
            data.education_level,
            data.email,
            data.hours,
            data.teacher

        ]

        db.query(query, values, function(err, results){
            if(err) throw `Database error! ${err} `
            
            callback(results.rows[0])
        })

    },
    find(id, callback){
        db.query(`
            SELECT students.*, teachers.name AS teacher_name
            FROM students
            LEFT JOIN teachers ON (students.teacher_id = teachers.id)
            WHERE students.id = $1
        `, [id], function(err, results){
            if(err) throw `Database error! ${err} `
            
            callback(results.rows[0])
        })
    },
    update(data, callback){
        const query = ` 
        UPDATE students SET
            avatar_url=($1),
            name=($2),
            birth_date=($3),
            education_level=($4),
            email=($5),
            hours=($6),
            teacher_id=($7)
        WHERE id = $8
        `
        const values = [
            data.avatar_url,
            data.name,
            date(data.birth_date).iso,
            data.education_level,
            data.email,
            data.hours,
            data.teacher,
            data.id
        ]

        db.query(query, values, function(err, results){
            if(err) throw `Database error! ${err} `

            callback()
        })
    },
    delete(id, callback){
        db.query(`DELETE FROM students WHERE id = $1 `, [id], function(err, results){
            if(err) throw `Database error! ${err} `

            return callback()
        })
    },
    teachersSelectOptions(callback){
        db.query(`SELECT name, id FROM teachers`, function(err, results){
            if(err) throw `Database error! ${err} `

            callback(results.rows)
        })
    },
    paginate(params){
        const { filter, limit, offset, callback } = params

        let query ="",
            filterQuery="",
            totalQuery= `(SELECT COUNT(*)FROM students) AS total`

        if( filter ){
            filterQuery = `
                WHERE students.name ILIKE '%${filter}%'
                OR students.email ILIKE '%${filter}%'
            `
            totalQuery = `(
                SELECT COUNT (*) FROM students
                ${filterQuery}
            )AS total`
        }

        query = `
            SELECT students.*, ${totalQuery}
            FROM students
            ${filterQuery}
            LIMIT $1 OFFSET $2
        `
        db.query(query, [limit, offset], function(err, results){
            if(err) throw `Database error ${err}`

            callback(results.rows)
        })
    }
}
