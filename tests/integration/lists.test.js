const request = require('supertest');
const { List } = require('../../models/list');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

describe('/api/lists', () => {

    describe('POST /', () => {

        let server;
        let token;
        let user;
        let userId;
    
        // Set up server and create arbitrary token before each test
        beforeEach(async () => { 
            server = require('../../index'); 
            userId = mongoose.Types.ObjectId();
            user = new User({
                _id: userId,
                username: 'user0',
                email: 'user0@email.com',
                password: '12345'
            });
            token = user.generateAuthToken();
            await user.save();
        });
    
        // Close server and wipe the Lists db after each test
        afterEach(async () => {
            await server.close();
            await List.remove();
            await User.remove();
        });
    
        // Define the happy path 
        const execRequest = () => {
            return request(server)
                .post('/api/lists')
                .set('x-auth-token', token)
                .send({ name: 'list1' });
        }

        it('should return 401 if no token is provided', async () => {
            token = '';
            const res = await execRequest();

            expect(res.status).toBe(401);
        });

        it('should return 400 if invalid token is provided', async () => {
            token = 'a';
            const res = await execRequest();

            expect(res.status).toBe(400);
        });

        it('should return 400 if token belongs to nonexistent user', async () => {
            token = new User().generateAuthToken();
            const res = await execRequest();

            expect(res.status).toBe(400);
        });
    });
});