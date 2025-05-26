import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly validCredentials = {
    email: 'info@cekgetir.com',
    password: '123',
  };

  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.debug(`Validating user: ${email}`);
    
    if (!email || !password) {
      this.logger.error('Email or password is missing');
      throw new UnauthorizedException('Email ve şifre gereklidir');
    }

    if (
      email === this.validCredentials.email &&
      password === this.validCredentials.password
    ) {
      this.logger.debug('Credentials are valid, generating token');
      
      const payload = { 
        email: this.validCredentials.email, 
        sub: 1,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      };
      
      const access_token = this.jwtService.sign(payload);
      
      return {
        access_token,
        expires_in: 3 * 60 * 60, // 3 saat (saniye cinsinden)
        token_type: 'Bearer'
      };
    }

    this.logger.error(`Invalid credentials for user: ${email}`);
    throw new UnauthorizedException('Geçersiz email veya şifre');
  }

  async refreshToken(token: string): Promise<any> {
    try {
      this.logger.debug('Attempting to refresh token');
      
      if (!token) {
        throw new UnauthorizedException('Token gereklidir');
      }

      const decoded = this.jwtService.verify(token);
      const payload = {
        email: decoded.email,
        sub: decoded.sub,
        role: decoded.role,
        iat: Math.floor(Date.now() / 1000)
      };
      
      const access_token = this.jwtService.sign(payload);
      
      this.logger.debug('Token refreshed successfully');
      return {
        access_token,
        expires_in: 3 * 60 * 60,
        token_type: 'Bearer'
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Geçersiz token');
    }
  }
} 