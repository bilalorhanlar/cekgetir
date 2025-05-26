import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly validCredentials = {
    email: 'info@cekgetir.com',
    password: '123',
  };

  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    if (
      email === this.validCredentials.email &&
      password === this.validCredentials.password
    ) {
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
    throw new UnauthorizedException('Geçersiz email veya şifre');
  }

  async refreshToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      const payload = {
        email: decoded.email,
        sub: decoded.sub,
        role: decoded.role,
        iat: Math.floor(Date.now() / 1000)
      };
      
      const access_token = this.jwtService.sign(payload);
      
      return {
        access_token,
        expires_in: 3 * 60 * 60,
        token_type: 'Bearer'
      };
    } catch (error) {
      throw new UnauthorizedException('Geçersiz token');
    }
  }
} 