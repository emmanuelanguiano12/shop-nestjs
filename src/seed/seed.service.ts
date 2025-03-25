import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService, // Inyectar el servicio de otro modulo
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ){}
  
  async runSeed(){
    await this.deleteTables()
    const adminUsers = await this.insertUsers()

    await this.insertNewProducts(adminUsers);

    return 'SEED EXECUTED';
  }

  private async deleteTables(){

    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder()
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers(){
    const seedUsers = initialData.users;

    const users: User[] = []

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    })

    const dbUsers = await this.userRepository.save(seedUsers)

    return dbUsers[0];

  }

  private async insertNewProducts(user: User){
    await this.productsService.deleteAllProducts();
    const seedProducts = initialData.products; // Es muy parecido a mi creatProductDto
    
    // Arreglo de promesas
    const insertPromises: any = []

    seedProducts.forEach(product => {
      insertPromises.push(this.productsService.create(product, user))
    });

    await Promise.all(insertPromises) //! Espera a que todas las promesas se resuelvan

    return true
  }
  
}
