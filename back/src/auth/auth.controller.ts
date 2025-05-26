import { Controller, Post, Body, UnauthorizedException, Logger, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

interface LoginDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`Login attempt for email: ${loginDto.email}`);
    
    try {
      const result = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );
      
      this.logger.debug('Login successful');
      return {
        success: true,
        ...result
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`);
      throw new UnauthorizedException({
        message: 'Geçersiz email veya şifre',
        error: 'Unauthorized'
      });
    }
  }

  @Post('refresh')
  async refreshToken(@Headers('authorization') auth: string) {
    try {
      if (!auth || !auth.startsWith('Bearer ')) {
        throw new UnauthorizedException('Geçersiz token formatı');
      }

      const token = auth.split(' ')[1];
      const result = await this.authService.refreshToken(token);
      
      return {
        success: true,
        ...result
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException({
        message: 'Token yenileme başarısız',
        error: 'Unauthorized'
      });
    }
  }
} 