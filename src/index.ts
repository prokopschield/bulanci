import { exec } from 'child_process';
import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';
import { unzipSync } from 'zlib';

class BulanciInstaller {
	#_file_name?: string;
	get file_name(): string {
		return this.#_file_name || 'bulanci.exe';
	}
	set file_name(new_name: string) {
		this.#_file_name = new_name;
	}
	#_installation_path?: string;
	get install_path(): string {
		if (this.#_installation_path) {
			return this.#_installation_path;
		}
		switch (process.platform) {
			case 'win32': {
				return (this.#_installation_path = path.resolve(
					os.homedir(),
					'AppData',
					'Local',
					'bulanci'
				));
			}
			case 'linux': {
				return (this.#_installation_path = path.resolve(
					os.homedir(),
					'.cache',
					'bulanci'
				));
			}
			case 'darwin': {
				return (this.#_installation_path = path.resolve(
					os.homedir(),
					'Library',
					'Application Support',
					'bulanci'
				));
			}
			default: {
				return (this.#_installation_path = path.resolve(
					os.homedir(),
					'bulanci'
				));
			}
		}
	}
	set install_path(new_path: string) {
		this.#_installation_path = new_path;
	}
	get exists(): boolean {
		return fs.existsSync(path.resolve(this.install_path, this.file_name));
	}
	download(
		url = 'https://cdn.nodesite.eu/static/bulanci.exe'
	): Promise<Buffer> {
		return new Promise((resolve) => {
			const rb = Array<Buffer>();
			https
				.request(url, (res) => {
					res.on('data', (c: Buffer) => rb.push(c));
					res.on('end', () => resolve(unzipSync(Buffer.concat(rb))));
				})
				.end();
		});
	}
	#_blob?: Buffer;
	get blob(): Promise<Buffer> | Buffer {
		return new Promise(async (resolve) => {
			if (this.#_blob) {
				return resolve(this.#_blob);
			}
			const downloaded = await this.download();
			this.#_blob = downloaded;
			return resolve(downloaded);
		});
	}
	set blob(blob: Buffer | Promise<Buffer>) {
		Promise.resolve(blob).then((blob) => (this.#_blob = blob));
	}
	async put(
		fspath = path.resolve(this.install_path, this.file_name),
		file: Buffer | Promise<Buffer> = this.blob
	) {
		const dir = path.resolve(fspath, '..');
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, {
				recursive: true,
			});
		}
		const blob = await Promise.resolve(file);
		return await fs.promises.writeFile(fspath, blob);
	}
	async run(fspath = path.resolve(this.install_path, this.file_name)) {
		if (process.platform === 'win32') {
			return exec(fspath);
		} else {
			return exec(`wine "${fspath}"`, { env: process.env });
		}
	}
}

const bulanci = new BulanciInstaller();

export default bulanci;
module.exports = bulanci;
