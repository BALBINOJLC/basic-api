/* eslint-disable @typescript-eslint/no-explicit-any */
import { IsNotEmpty, IsString } from 'class-validator';

class Item {
    id: number;

    name: string;

    price: string;

    product_id?: number;

    title: string;

    variant_id: number;

    variant_title: string;

    image: any;

    comment?: string;
}

class Product {
    @IsNotEmpty()
    @IsString()
    id: number;

    @IsNotEmpty()
    @IsString()
    product_id: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    variant_id: string;

    @IsNotEmpty()
    @IsString()
    image: any;
}

export class ItemMapper {
    public static productToItem(products: Product[]): Item[] {
        const items = products.map((product: Product) => {
            const item = new Item();
            item.id = product.id;
            item.product_id = product.id;
            item.name = product.title;
            item.title = product.title;
            item.variant_id = product.id;
            item.image = product.image;
            return item;
        });
        return items;
    }
}
