import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        login: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return access token on successful login', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password',
            };
            const result = { access_token: 'jwt_token' };
            mockAuthService.login.mockResolvedValue(result);

            expect(await controller.login(loginDto)).toBe(result);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
        });

        it('should throw UnauthorizedException on invalid credentials', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'wrong_password',
            };
            mockAuthService.login.mockRejectedValue(new UnauthorizedException());

            await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
