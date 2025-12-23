import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/user/oss';
import path from 'path';
import * as fs from 'fs';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('upload/large')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads' }))
  uploadLargeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name: string },
  ) {
    console.log('🔥 ENTER uploadLargeFile');
    console.log('file:', file);
    console.log('body:', body);

    const filename = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name;

    const nameDir = 'uploads/chunks-' + filename;

    if (!fs.existsSync(nameDir)) fs.mkdirSync(nameDir);

    fs.cpSync(file.path, path.join(nameDir, body.name));
    fs.rmSync(file.path);

    return { ok: true, nameDir };
  }

  @Post('upload/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter(req, file, callback) {
        const extName = path.extname(file.originalname);
        if (['.jpg', '.png', '.gif'].includes(extName)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Upload file failed!'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file.path;
  }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
