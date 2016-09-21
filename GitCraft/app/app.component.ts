import {Component, OnDestroy, NgZone} from "@angular/core";
// import {RouterConfig} from "@angular/router";
// import {NS_ROUTER_DIRECTIVES, nsProvideRouter} from "nativescript-angular/router";

import { isAndroid, isIOS } from "platform";
import * as application from  "application";

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
export class AppComponent implements OnDestroy {
    private static onActivityResumedHandler;

    constructor(private github: GitHubService, private zone: NgZone) {

        // TODO: Otherwise change detection does not trigger.
        this.github.zone = zone;

        if (isAndroid) {
            if (AppComponent.onActivityResumedHandler) {
                application.android.off("activityResumed", AppComponent.onActivityResumedHandler);
            }
            AppComponent.onActivityResumedHandler = args => {
                console.log("activityResumed!");
                let intent = args.activity.getIntent();
                let data = intent.getData();
                if (data) {
                    let scheme = data.getScheme();
                    let host = data.getHost();
                    if (scheme === "gitcraft" && host === "oauth-cb") {
                        let code = data.getQueryParameter("code");
                        let state = data.getQueryParameter("state");
                        this.github.exchangeForAccessToken({ code, state });
                    }
                }
            };
            application.android.on("activityResumed", AppComponent.onActivityResumedHandler);
        }   
    }

    ngOnDestroy() {
        // This does not fire!
        console.log("ngOnDestroy");
        application.android.off("activityResumed", AppComponent.onActivityResumedHandler);
        AppComponent.onActivityResumedHandler = undefined;
    }
}
