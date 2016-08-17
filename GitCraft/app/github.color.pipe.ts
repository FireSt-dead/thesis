import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'backgroundColor'})
export class BackgroundColorPipe implements PipeTransform {
    transform(gitColor: string): string {
        let nativeScriptColorString = "#" + gitColor;
        return nativeScriptColorString;
    }
}