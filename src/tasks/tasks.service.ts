import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  private logger = new Logger(TasksService.name, {timestamp: true});
  constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) {
  }

  async getAllTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');
    query.where({user});
    const {status, search} = filterDto;
    if (status) {
      query.andWhere('task.status = :status', {status: status});
    }
    if (search) {
      query.andWhere('(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))', {search: `%${search}%`});
    }
    try {
      return await query.getMany();
    } catch (e) {
      this.logger.error(`Failed to get tasks for user "${user.username}". Filters: ${JSON.stringify(filterDto)}`, e.stack)
      throw new InternalServerErrorException()
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id: id, user: user });
    if (!task) {
      throw new NotFoundException('Task Not Found');
    }
    return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, user });
    if (result.affected === 0) {
      throw new NotFoundException('Task Not Found');
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: TaskStatus.OPEN,
      user: user
    });
    await this.taskRepository.save(task);
    return task;
  }

  async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.taskRepository.save(task);
    return task;
  }
}
