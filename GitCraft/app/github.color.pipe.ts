import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'backgroundColor'})
export class BackgroundColorPipe implements PipeTransform {
    transform(gitColor: string): string {
        let nativeScriptColorString = "#" + gitColor;
        return nativeScriptColorString;
    }
}

@Pipe({name: 'color'})
export class ColorPipe implements PipeTransform {
    transform(gitColor: string): string {
        let baseColor = parseInt("0x" + gitColor);
        if ((baseColor & 0xFF0000) < 0x660000 || (baseColor & 0x00FF00) < 0x006600 || (baseColor & 0x0000FF) < 0x000066) {
            return "#FFFFFF";
        } else {
            return "#000000";
        }
    }
}