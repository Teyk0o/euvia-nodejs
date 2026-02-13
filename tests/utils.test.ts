import { describe, it, expect, beforeEach } from 'vitest';
import { hashPath, unhashPath, getDeviceCategory, getScreenBucket } from '../src/shared/utils';

describe('Shared Utils', () => {
  describe('hashPath', () => {
    beforeEach(() => {
      // Mock window for browser environment
      global.window = {} as any;
      global.btoa = (str: string) => Buffer.from(str).toString('base64');
    });

    it('should hash pathname to base64', () => {
      const result = hashPath('/home');
      expect(result).toBe('L2hvbWU=');
    });

    it('should handle special characters', () => {
      const result = hashPath('/search?q=test&lang=fr');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return empty string in non-browser environment', () => {
      delete (global as any).window;
      const result = hashPath('/test');
      expect(result).toBe('');
    });
  });

  describe('unhashPath', () => {
    beforeEach(() => {
      global.atob = (str: string) => {
        // Validate base64 format
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(str)) {
          throw new Error('Invalid base64 string');
        }
        return Buffer.from(str, 'base64').toString();
      };
    });

    it('should unhash base64 to pathname', () => {
      const hashed = 'L2hvbWU=';
      const result = unhashPath(hashed);
      expect(result).toBe('/home');
    });

    it('should handle invalid base64', () => {
      const result = unhashPath('invalid!!!');
      expect(result).toBe('invalid!!!');
    });

    it('should handle URL-encoded paths', () => {
      const encoded = Buffer.from(encodeURIComponent('/search?q=test')).toString('base64');
      const result = unhashPath(encoded);
      expect(result).toBeTruthy();
    });
  });

  describe('getDeviceCategory', () => {
    it('should detect mobile devices', () => {
      const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(getDeviceCategory(mobileUA)).toBe('mobile');
    });

    it('should detect desktop devices', () => {
      const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(getDeviceCategory(desktopUA)).toBe('desktop');
    });

    it('should detect tablet devices', () => {
      const tabletUA = 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)';
      expect(getDeviceCategory(tabletUA)).toBe('tablet');
    });

    it('should handle Android tablets', () => {
      const androidTabletUA = 'Mozilla/5.0 (Linux; Android 11; SM-T870)';
      expect(getDeviceCategory(androidTabletUA)).toBe('tablet');
    });

    it('should detect Kindle tablets', () => {
      const kindleUA = 'Mozilla/5.0 (Linux; Android 4.4.3; KFTHWI)';
      expect(getDeviceCategory(kindleUA)).toBe('tablet');
    });

    it('should detect Playbook tablets', () => {
      const playbookUA = 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0)';
      expect(getDeviceCategory(playbookUA)).toBe('tablet');
    });

    it('should detect BlackBerry mobile', () => {
      const blackberryUA = 'BlackBerry9700/5.0.0.862';
      expect(getDeviceCategory(blackberryUA)).toBe('mobile');
    });

    it('should detect iPod as mobile', () => {
      const ipodUA = 'Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0)';
      expect(getDeviceCategory(ipodUA)).toBe('mobile');
    });

    it('should detect Opera Mini as mobile', () => {
      const operaMiniUA = 'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80)';
      expect(getDeviceCategory(operaMiniUA)).toBe('mobile');
    });

    it('should handle empty user agent', () => {
      expect(getDeviceCategory('')).toBe('desktop');
    });
  });

  describe('getScreenBucket', () => {
    beforeEach(() => {
      global.window = {
        screen: {
          width: 1920,
          height: 1080,
        },
      } as any;
    });

    it('should return exact match for 1920x1080', () => {
      global.window.screen = { width: 1920, height: 1080 } as any;
      const result = getScreenBucket();
      expect(result).toBe('1920x1080');
    });

    it('should return closest match for similar resolution', () => {
      global.window.screen = { width: 1900, height: 1070 } as any;
      const result = getScreenBucket();
      expect(result).toBe('1920x1080');
    });

    it('should handle mobile screen sizes', () => {
      global.window.screen = { width: 375, height: 667 } as any;
      const result = getScreenBucket();
      expect(result).toBe('375x667');
    });

    it('should handle 4K resolution', () => {
      global.window.screen = { width: 2560, height: 1440 } as any;
      const result = getScreenBucket();
      expect(result).toBe('2560x1440');
    });

    it('should handle tablet resolution', () => {
      global.window.screen = { width: 1366, height: 768 } as any;
      const result = getScreenBucket();
      expect(result).toBe('1366x768');
    });

    it('should return unknown when window is not defined', () => {
      delete (global as any).window;
      const result = getScreenBucket();
      expect(result).toBe('unknown');
    });
  });
});
