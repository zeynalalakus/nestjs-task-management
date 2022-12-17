import { Body, Controller, Delete, Get, Param, Post, Patch, Query, UseGuards, Logger } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger(TasksController.name);
  constructor(private readonly tasksService: TasksService) {
  }

  @Get()
  getAllTasks(@Query() filterDto: GetTasksFilterDto, @GetUser() user: User): Promise<Task[]> {
    this.logger.verbose(`User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`)
    return this.tasksService.getAllTasks(filterDto, user);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(`User "${user.username}" creating a new task. Data: ${JSON.stringify(createTaskDto)}`)
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Patch(':id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, updateTaskStatusDto.status, user);
  }


  @Get(':id')
  async getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    return await this.tasksService.getTaskById(id, user);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string,
                   @GetUser() user: User): Promise<void> {
    await this.tasksService.deleteTask(id, user);
  }

}
