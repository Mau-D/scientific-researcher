import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorksController } from './works/works.controller';
import { WorksService } from './works/works.service';
import { WorksModule } from './works/works.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    WorksModule,
    ConfigModule.forRoot({
      isGlobal: true, // disponible partout dans l’app
      envFilePath: ['.env.development', '.env'],
    }),
  ],
  controllers: [AppController, WorksController],
  providers: [AppService, WorksService],
})
export class AppModule {}
// TODO:En prod, tu changeras le envFilePath ou tu utiliseras des variables système (CI).