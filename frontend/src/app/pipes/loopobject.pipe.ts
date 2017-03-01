import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'loopobject'})
export class LoopObjectPipe implements PipeTransform {
  transform(value: any, args: string[]): any {
    if (!value) return value;

    let list: any[] = [];
    for (let key in value){
      list.push(value[key]);
    }
    return list;
  }
}
