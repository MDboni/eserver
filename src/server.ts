import express, { type Application, type Request, type Response } from 'express'
import { Pool } from "pg";
const app : Application = express()
const port = 3005


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text())

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_MqFUAYLO7QB8@ep-icy-term-aqrswobn-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
})

const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20) NOT NULL,
                age INT NOT NULL,
                email VARCHAR(20) NOT NULL UNIQUE,
                password VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `)
    } catch (error) {
        console.error("Error initializing database:", error)
    }
}

initDB()



app.get('/', (req: Request, res: Response) => {
   res.status(200).json({
        message: 'Hello World',
        "author": "L2"
   })
})

app.post("/api/post", async(req: Request, res: Response) => {

   try {
    const { name, age, email, password } = req.body
    const result = await pool.query(`
        INSERT INTO users (name, age, email, password) VALUES ($1, $2, $3, $4) RETURNING *;
        `,
        [name, age, email, password]
    )
    res.status(201).json({
        message: "User created successfully",
        user: result.rows[0]
    })
   } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ message: "Error creating user", error})
   }
    
})

app.get("/api/users", async(req:Request, res:Response)=>{
    try {
        const result = await pool.query(`
            SELECT * FROM users;
            `)
            res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: result.rows ,
            })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error
        })
        
    }
})

app.get("/api/users/:id", async(req:Request, res:Response)=>{
    const { id } = req.params 
    try {
        const result = await pool.query(`
            SELECT * FROM users WHERE id = $1;
            `, [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "User retrieved successfully",
            data: result.rows[0] ,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error
        })
    }
})

app.put("/api/users/:id", async(req:Request, res:Response)=>{
    const { id } = req.params
    const { name, age, email, password } = req.body

    try {
        const result = await pool.query(`
                    update users SET 
                        name = COALESCE($1, name),
                        age = COALESCE($2, age),
                        email = COALESCE($3, email),
                        password = COALESCE($4, password)  
                    WHERE id = $5 RETURNING *;
                `, [name, age, email, password, id])
        
             res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0]
        })
    } catch (error:any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error
        })
    }
})

app.delete("/api/users/:id", async(req:Request, res:Response)=>{
    const { id } = req.params

    try {
        const result = await pool.query(`
            DELETE FROM users WHERE id = $1 RETURNING *;
        `, [id])
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: result.rows[0]
        })
    } catch (error:any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error
        })
    }

})


app.post("/boni",(req: Request, res: Response) => {
    const { name, age } = req.body

    res.status(200).json({
        message: `Hello ${name}, you are ${age} years old`
    })

    console.log(`Hello ${name}, you are ${age} years old`)
})



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
