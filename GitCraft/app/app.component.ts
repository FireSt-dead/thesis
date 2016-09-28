import {Component, OnDestroy, NgZone} from "@angular/core";

import {HomeComponent} from "./home.component";
import {UserComponent} from "./user.component";
import {RepositoriesComponent} from "./repositories.component";
import {RepositoryComponent} from "./repository.component";
import {MilestoneComponent} from "./milestone.component";
import {NotificationsComponent} from "./notifications.component";
import {IssueComponent} from "./issue.component";

import {GitHubService, Repository, Organization, Milestone } from "./github.service";

@Component({
    selector: "my-app",
    templateUrl: "app.component.html",
    providers: [GitHubService]
})
export class AppComponent {
    private static onActivityResumedHandler;

    constructor(private github: GitHubService, private zone: NgZone) {
        // TODO: Otherwise change detection does not trigger.
        this.github.zone = zone;
    }
}
