/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IJwtUser } from '@auth';
import * as bcrypt from 'bcrypt';
import _ from 'lodash';

export const slugCreator = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
};

export const nameCleaner = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-.]+/g, ''); // Allow periods in the result
};

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

export const userjwt = (user: any): IJwtUser => {
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

export const userNameAndCharter = (email: string) => {
    const hash = new Date().getTime();
    const length = 13;
    const hasUser = hash.toString().substring(9, length);
    const user_name = `${email.split('@')[0].trim()}${hasUser}`;
    const photo_url = {
        name: 'no-image',
        color: randonColor(),
        charter: user_name.charAt(0).toUpperCase(),
    };

    return { user_name, photo_url };
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

export const parseDateToUTC = (date: string | Date): Date | null => {
    try {
        // Si date es proporcionado y es una fecha válida, usarlo; si no, usar la fecha actual
        const inputDate = new Date(date);
        if (isNaN(inputDate.getTime())) {
            throw new Error('Fecha inválida');
        }

        // Construir la fecha en UTC al inicio del día
        const year = inputDate.getUTCFullYear();
        const month = inputDate.getUTCMonth(); // Para Date.UTC, los meses van de 0 a 11
        const day = inputDate.getUTCDate();

        // Crear un nuevo objeto Date en UTC al inicio del día
        const utcDate = new Date(Date.UTC(year, month, day));

        return utcDate;
    } catch (error) {
        console.error(error.message);
        return null;
    }
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

export const calculateSimilarity = (cadena1: string, cadena2: string): number => {
    // Función para limpiar la cadena: quita acentos y caracteres no alfabéticos, excepto espacios
    const limpiarCadena = (cadena: string): string => {
        return cadena
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quita acentos
            .replace(/[^a-zA-Z\s]/g, '') // Quita caracteres no alfabéticos, excepto espacios
            .toLowerCase() // Convierte a minúsculas
            .trim(); // Elimina espacios al inicio y al final
    };

    // Descompone las cadenas en arrays de palabras después de limpiarlas
    const palabras1: string[] = limpiarCadena(cadena1).split(/\s+/).filter(Boolean);
    const palabras2: string[] = limpiarCadena(cadena2).split(/\s+/).filter(Boolean);

    // Verifica si al menos una palabra de la primera cadena está en la segunda
    const tieneCoincidencia: boolean = palabras1.some((palabra) => palabras2.includes(palabra));

    // Devuelve 1 si hay coincidencia, de lo contrario 0
    return tieneCoincidencia ? 1 : 0;
};
