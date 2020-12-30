const request = require('supertest');
const { List } = require('../../models/list');
const { User } = require('../../models/user');
const mongoose = require('mongoose');
let server;
let token;

describe('/api/lists', () => {
    // Set up server and create arbitrary token before each test
    beforeEach(() => { 
        server = require('../../index'); 
        token = new User().generateAuthToken();
    });

    // Close server and wipe the Lists db after each test
    afterEach(async () => {
        await server.close();
        await List.remove();
    });

    // Define the happy path 
    const execRequest = () => {
        return request(server)
            .post('/api/lists')
            .set('x-auth-token', token)
            .send({ name: 'list1' });
    }

    describe('POST /', () => {
        it('should return 401 if no token is provided', async () => {
            token = '';
            const res = await execRequest();

            expect(res.status).toBe(401);
        });
    });
});