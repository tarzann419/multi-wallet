import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import bodyParser from 'body-parser';
import authRoute from './routes/auth.routes.js';

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


// Routes
app.use('/api/v1/auth', authRoute);

// Sample route
app.get('/', (req, res) => {
    res.send('Hello, Node.js!');
});

try {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server connected on port ${port}! Happy coding!✅✅✅`);
    });
} catch (error) {
    console.log(error);
    process.exit(1);
}

export default app;
