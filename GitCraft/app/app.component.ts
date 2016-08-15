import {Component} from "@angular/core";
import {Http} from '@angular/http';

// TODO: JSONP?

import {GitHub, Repository, Organization} from "./service/github";

@Component({
    selector: "my-app",
    templateUrl: "app.component.html",
    providers: [GitHub]
})
export class AppComponent {
    public counter: number = 16;

    repositories: Repository[];

    constructor(private github: GitHub) {
        this.repositories = this.github.request("orgs", "NativeScript", "repos");
        console.log("Repositories: " + this.repositories);
    }

    public get message(): string {
        if (this.counter > 0) {
            return this.counter + " taps left!";
        } else {
            return "Hoorraaay! \nYou are ready to start building!";
        }
    }
    
    public onTap() {
        this.counter--;
    }
}
