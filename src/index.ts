/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { parse } from 'url';

import axios from 'axios';
import tar from 'tar';
import rimraf from 'rimraf';

const error = (msg: Error | string | null) => {
  console.error(msg);
  process.exit(1);
};

class Binary {
  url: string;

  name?: string;

  installDirectory: string;

  binaryPath?: string;

  constructor(url: string, data: { name?: string, installDirectory?: string }) {
    const errors: string[] = [];

    if (typeof url !== 'string') {
      errors.push('url must be a string');
    } else {
      try {
        parse(url);
      } catch (e) {
        errors.push(e);
      }
    }

    if (data.name && typeof data.name !== 'string') {
      errors.push('name must be a string');
    }

    if (data.installDirectory && typeof data.installDirectory !== 'string') {
      errors.push('installDirectory must be a string');
    }

    if (!data.installDirectory && !data.name) {
      errors.push('You must specify either name or installDirectory');
    }

    if (errors.length > 0) {
      let errorMsg = 'Your Binary constructor is invalid:';

      errors.forEach((err) => {
        errorMsg += err;
      });

      error(errorMsg);
    }

    this.url = url;
    this.name = data.name;
    this.installDirectory = data.installDirectory || join(__dirname, 'artifact');
  }

  getInstallDirectory() {
    if (!existsSync(this.installDirectory)) {
      mkdirSync(this.installDirectory, { recursive: true });
    }

    return this.installDirectory;
  }

  getBinaryPath() {
    if (!this.binaryPath) {
      const binaryDirectory = this.getInstallDirectory();
      this.binaryPath = join(binaryDirectory, this.name as string);
    }

    return this.binaryPath;
  }

  install() {
    const dir = this.getInstallDirectory();
    if (existsSync(dir)) {
      rimraf.sync(dir);
    }

    mkdirSync(dir, { recursive: true });

    console.log(`Downloading release from ${this.url}`);

    return axios({ url: this.url, responseType: 'stream' })
      .then((res) => {
        res.data.pipe(tar.x({ strip: 1, C: dir }));
      })
      .then(() => {
        console.log(
          `${this.name ? this.name : 'Your package'} has been installed!`,
        );
      })
      .catch((e: Error) => {
        error(`Error fetching release: ${e.message}`);
      });
  }

  uninstall() {
    if (existsSync(this.getInstallDirectory())) {
      rimraf.sync(this.installDirectory);
      console.log(
        `${this.name ? this.name : 'Your package'} has been uninstalled`,
      );
    }
  }

  run() {
    const binaryPath = this.getBinaryPath();
    const [ , , ...args ] = process.argv;

    const result = spawnSync(binaryPath, args, { cwd: process.cwd(), stdio: 'inherit' });

    if (result.error) {
      error(result.error);
    }

    process.exit(result.status || 0);
  }
}

module.exports = Binary;
