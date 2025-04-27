import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StreamChat } from 'stream-chat';
import { Messages } from 'openai/resources/chat/completions/messages.mjs';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Stream Client
const chatClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
);



app.post(
    '/register-user',
    async (req: Request, res: Response): Promise<any> => {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        try {
            const userId = email.replace(/[^a-zA-Z0-9_-]/g, '_');

            // Check if user exists
            const userResponse = await chatClient.queryUsers({ id: { $eq: userId } });

            if (!userResponse.users.length) {
                // Add new user to stream
                await chatClient.upsertUser({
                    id: userId,
                    name: name,
                    email: email,
                    role: 'user',
                });
            }

            // Check for existing user in database
            // const existingUser = await db
            //   .select()
            //   .from(users)
            //   .where(eq(users.userId, userId));

            // if (!existingUser.length) {
            //   console.log(
            //     `User ${userId} does not exist in the database. Adding them...`
            //   );
            //   await db.insert(users).values({ userId, name, email });
            // }

            res.status(200).json({ userId, name, email });

            
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);








const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));