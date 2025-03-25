//! Esto es lo que busca typeORM para referenciar a la base de datos (Representación de como es en la base de datos)

import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

@Entity({name: 'products'})
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text',{
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    //images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    ) // Un producto a muchas imagenes
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user: User

    @BeforeInsert()
    checkSlug(){
        if(!this.slug){
            this.slug = this.title
        }

        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '')
    }

    @BeforeUpdate()
    updateSlug(){
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '')
    }

}
