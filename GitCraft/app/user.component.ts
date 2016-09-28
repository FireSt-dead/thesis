import {Component} from "@angular/core";
import {GitHubService, Repository, Organization, Milestone } from "./github.service";
import {Router, ActivatedRoute} from "@angular/router";
import {Location} from '@angular/common';

@Component({
    selector: "User",
    templateUrl: "user.component.html",
    styleUrls: ["user.component.css"]
})
export class UserComponent {
    constructor(public github: GitHubService, public location: Location) {
        console.log("Create UserComponent");
    }
}