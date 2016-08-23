import {Component, ChangeDetectionStrategy} from "@angular/core";
import {Router} from "@angular/router";
import {GitHub} from "./github.service";

@Component({
    selector: "Home",
    templateUrl: "home.component.html",
    styleUrls: ["home.component.css"]
})
export class HomeComponent {
    constructor(public github: GitHub, public router: Router) {
        console.log("new HomeComponent!");
    }
}