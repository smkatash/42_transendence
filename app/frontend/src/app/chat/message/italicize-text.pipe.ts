import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'italicizeText'
})
export class ItalicizeTextPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    return value.replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
}
