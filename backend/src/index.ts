import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import raffleRoutes from './routes/raffles';
import userRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`OP Raffle API running on port ${PORT}`);
});
