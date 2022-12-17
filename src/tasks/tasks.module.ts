import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [TasksController],
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  providers: [TasksService]
})
export class TasksModule {}
