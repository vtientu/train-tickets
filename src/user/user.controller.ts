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

  //Merge file chunks
  @Post('merge/file')
  async mergeFile(@Body() body: { filename: string }) {
    const nameDir = 'uploads/chunks-' + body.filename;

    if (!fs.existsSync(nameDir)) {
      throw new BadRequestException('Filename is incorrect.');
    }

    const files = fs.readdirSync(nameDir);

    files.sort((a, b) => {
      const indexA = a.match(/-(\d+)$/)?.[1];
      const indexB = b.match(/-(\d+)$/)?.[1];

      return Number(indexA) - Number(indexB);
    });

    const finalFilePath = 'uploads/' + body.filename;

    fs.writeFileSync(finalFilePath, '');

    // Merge files sequentially
    for (const file of files) {
      await new Promise((resolve, reject) => {
        const filePath = path.join(nameDir, file);
        const readStream = fs.createReadStream(filePath);
        const writeStream = fs.createWriteStream(finalFilePath, { flags: 'a' });
        readStream.pipe(writeStream);

        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve('success'));
      });
    }

    fs.rmSync(nameDir, { recursive: true, force: true });
  }

  @Post('upload/large')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads' }))
  uploadLargeFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name: string },
  ) {
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
