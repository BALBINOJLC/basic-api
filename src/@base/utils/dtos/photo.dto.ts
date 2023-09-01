import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PhotoDto {
    @IsOptional()
    @IsString()
    url?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    key?: string;

    @IsOptional()
    @IsString()
    extension?: string;

    @IsOptional()
    @IsString()
    mimetype?: string;

    @IsOptional()
    @IsNumber()
    size?: number;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    charter?: string;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsString()
    bucket?: string;
}
