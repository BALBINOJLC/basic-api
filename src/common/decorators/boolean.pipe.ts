import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ParseMultipleBoolPipe implements PipeTransform<any> {
    transform(value: any) {
        if (typeof value === 'object' && value !== null) {
            return this.parseObject(value);
        }
        return this.parseBoolean(value);
    }

    private parseObject(obj: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = this.parseBoolean(obj[key]);
            }
        }
        return result;
    }

    private parseBoolean(value: any): boolean {
        if (typeof value === 'string') {
            value = value.toLowerCase();
        }
        return value === true || value === 'true' || value === '1';
    }
}
