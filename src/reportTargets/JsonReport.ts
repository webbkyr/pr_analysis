import fs from 'fs';
import { OutputTarget } from './types';

export class JsonReport implements OutputTarget {
  static generate<T>(options: { filename: string, data: T}) {
    return new JsonReport(options.filename).print(options.data)
  }
  constructor(public filename: string) {}
  
  print<T>(report: T): void {
    fs.writeFileSync(`./${this.filename}.json`, JSON.stringify(report, undefined, 2))
  }
}