import {Component} from "@angular/core";

import {RepositoriesComponent} from "./repositories.component";
import {RepositoryComponent} from "./repository.component";
import {MilestoneComponent} from "./milestone.component";

import {RouterConfig} from "@angular/router";
import {NS_ROUTER_DIRECTIVES, nsProvideRouter} from "nativescript-angular/router";

@Component({
    selector: "my-app",
    directives: [NS_ROUTER_DIRECTIVES],
    templateUrl: "app.component.html"
})
export class AppComponent {
}

export const APP_ROUTES: RouterConfig = [
  { path: "", component: RepositoriesComponent },
  { path: "repository/:owner/:name", component: RepositoryComponent },
  { path: "milestone/:owner/:name/:milestone", component: MilestoneComponent }
];

export const APP_ROUTER_PROVIDERS = nsProvideRouter(
  APP_ROUTES,
  { enableTracing: false }
);
