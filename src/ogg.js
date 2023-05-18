import axios from "axios";
import Ffmpeg from "fluent-ffmpeg";
import installer from '@ffmpeg-installer/ffmpeg';
import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFile } from "./utils.js";

const __dirName = dirname(fileURLToPath(import.meta.url));

class OggConverter {
    constructor() {
        Ffmpeg.setFfmpegPath(installer.path);
    }

    toMp3(input, output) {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`);
            return new Promise((resolve, reject) => {
                Ffmpeg(input)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        removeFile(input);
                        resolve(outputPath);
                    })
                    .on('error', err => reject(err.message))
                    .run()
            })
        } catch (e) {
            console.log('Error while converting to mp3', e.message);
        }
    }

    async create(url, fileName) {
        try {
            const oggPath = resolve(__dirName, '../voices/', `${fileName}.ogg`);

            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            })

            return new Promise(resolve => {
                const stream = createWriteStream(oggPath);

                response.data.pipe(stream);
    
                stream.on('finish', () => {
                    resolve(oggPath);
                })
            })
        } catch (e) {
            console.log('Error while creating OGG', e.message);
        }
    }
}

export const ogg = new OggConverter();