/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bcrypt from 'bcrypt';
import _ from 'lodash';

import * as moment from 'moment';
import { IJwtUser } from './interfaces';
import { IUser } from '@users';

export const hassPassword = (password: string): string => {
    return bcrypt.hashSync(password, 10);
};

export const randonColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const sumNumberArray = (array: number[]): number => {
    return array.reduce((a, b) => {
        return a + b;
    }, 0);
};

export interface UserNameAndCharterResponse {
    user_name: string;
    photo_url: {
        name: string;
        color: string;
        charter: string;
    };
}

export const userjwt = (user: IUser): IJwtUser => {
    const userJwt: IJwtUser = {
        _id: String(user._id),
        email: user.email,
        user_name: user.user_name,
        role: user.role,
        type: user.type,
        display_name: user.display_name,
    };

    return userJwt;
};

const randomColor = (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

const generateUserName = (email: string): string => {
    const hash = new Date().getTime().toString();
    const userHash = hash.substring(hash.length - 4);
    return `${email.split('@')[0].trim()}${userHash}`;
};

const generatePhotoUrl = (userName: string): { name: string; color: string; charter: string } => {
    return {
        name: 'no-image',
        color: randomColor(), // Ensure this function exists and is imported
        charter: userName.charAt(0).toUpperCase(),
    };
};

export const userNameAndCharter = (email: string): UserNameAndCharterResponse => {
    const userName = generateUserName(email);
    const photoUrl = generatePhotoUrl(userName);

    return { user_name: userName, photo_url: photoUrl };
};

export const generateUniqueRandomNumber = () => {
    const min = 10000; // Valor mínimo de 5 dígitos
    const max = 99999; // Valor máximo de 5 dígitos
    const uniqueNumbers = new Set(); // Conjunto para almacenar números únicos generados

    while (true) {
        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min; // Generar número aleatorio

        if (!uniqueNumbers.has(randomNumber)) {
            uniqueNumbers.add(randomNumber);
            return randomNumber;
        }

        if (uniqueNumbers.size === max - min + 1) {
            throw new Error('No se pueden generar más números únicos de 5 dígitos');
        }
    }
};

export const sumArrByKey = (arr: any[], keyGroup: string, labelSum: string) => {
    const output = _(arr)
        .groupBy(keyGroup)
        .map((objs, key) => ({
            [keyGroup]: key,
            [labelSum]: _.sumBy(objs, labelSum),
        }))
        .value();

    return output;
};

export const sumArrParam = (arr: any[], param: string): number => {
    return arr.reduce((total, arg) => total + arg[param], 0);
};

export const setQueryParams = (params: any) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
        queryParams.set(key, params[key]);
    });
    return queryParams;
};

export const getBMI = (weight: number, height: number): number => {
    const bmi = (weight / Math.pow(height, 2)) * 10000;
    return parseFloat(bmi.toFixed(2));
};

export const parseDateUTC = (date: Date) => {
    const dateParsed: any = moment(date).utcOffset(0);
    dateParsed.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    dateParsed.toISOString();
    dateParsed.format();
    const response = new Date(dateParsed.format());
    return response;
};

export const rBuyOrder = () => {
    const randon = 'O-' + Math.floor(Math.random() * 1000000) + 1;
    return randon;
};

const get_currency = (value: any) => {
    const dataLocal = { locale: 'es-CL', currency: 'CLP' };

    let amount = value === null ? 0 : value;

    amount = dataLocal.locale === 'es-CL' ? parseInt(amount) : parseFloat(amount);
    //alert(amount)
    const formatter = new Intl.NumberFormat(dataLocal.locale, {
        style: 'currency',
        currency: dataLocal.currency,
    });
    let amount_string = formatter.format(amount);
    // menos a los 10 mil falla y por eso se agrega esto
    amount_string = amount_string.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return amount_string;
};

export const HelperCoin = {
    format: get_currency,
};

// set unique string from array string
export const setUniqueString = (arr: string[]) => {
    const unique = [...new Set(arr)];
    return unique;
};

export const removeHTMLTags = (text: string): string => {
    const regex = /<[^>]*>/g;
    return text.replace(regex, '');
};

export const convertProducts = (products: any[]) => {
    const productsConverted = products.map((product) => {
        const productConverted = {
            ...product,
            price: product.price ? HelperCoin.format(product.price) : 0,
            price_sale: product.price_sale ? HelperCoin.format(product.price_sale) : 0,
            image: product.image?.url
                ? product.image.url
                : 'https://divisi-app.s3.amazonaws.com/1685384211972-dummy_600x400_ffffff_cccccc.png',
        };
        return productConverted;
    });
    return productsConverted;
};

export const getToken = (req) => {
    const token = (req.headers.authorization || '').split(' ')[1] || '';
    return token;
};
