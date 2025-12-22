import { Inject, Injectable } from '@nestjs/common';
import { access, readFile, writeFile } from 'fs/promises';
import type { DbModuleOptions } from 'src/db/db.module';

@Injectable()
export class DbService {
  @Inject('OPTIONS')
  private options: DbModuleOptions;

  async write(obj: Record<string, any>) {
    // Save on Database
    await writeFile(this.options.path, JSON.stringify(obj || []), {
      encoding: 'utf-8',
    });
  }

  async read() {
    try {
      const path = this.options.path;
      await access(path);

      const data = await readFile(this.options.path, {
        encoding: 'utf-8',
      });

      const passed = JSON.parse(data);
      return Array.isArray(passed) ? passed : [];
    } catch (error) {
      return [];
    }
  }
}
